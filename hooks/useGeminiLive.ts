import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, ChatMessage } from '../types';
import { decode, decodeAudioData, createPcmBlob } from '../utils/audioUtils';

// Configuration
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
const SAMPLE_RATE_INPUT = 16000;
const SAMPLE_RATE_OUTPUT = 24000;

export const useGeminiLive = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Refs for audio context and processing
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio playback queue
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session management
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const clientRef = useRef<GoogleGenAI | null>(null);
  
  // Transcription State
  const currentInputTranscription = useRef<string>('');
  const currentOutputTranscription = useRef<string>('');

  const disconnect = useCallback(() => {
    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    // Stop source
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Stop all playing audio
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* ignore */ }
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Close contexts
    if (inputAudioContextRef.current?.state !== 'closed') {
      inputAudioContextRef.current?.close();
    }
    if (outputAudioContextRef.current?.state !== 'closed') {
      outputAudioContextRef.current?.close();
    }
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;

    // Reset state
    setConnectionState(ConnectionState.DISCONNECTED);
    setVolumeLevel(0);
  }, []);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
      console.error("API Key missing");
      setConnectionState(ConnectionState.ERROR);
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      setMessages([]); // Clear chat history on new connection

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: SAMPLE_RATE_INPUT });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: SAMPLE_RATE_OUTPUT });

      // Initialize GenAI Client
      clientRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Start Session
      const sessionPromise = clientRef.current.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          // Enable transcription
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are NOVA, a futuristic, friendly, and highly intelligent AI assistant. You are currently in a demo mode. Your goal is to explore the universe of knowledge with the user. You speak with a calm, clear, and engaging tone. Keep your responses relatively concise but informative. You are capable of discussing complex topics about space, science, and the future.",
        },
        callbacks: {
          onopen: () => {
            console.log("NOVA Connection Opened");
            setConnectionState(ConnectionState.CONNECTED);

            // Setup Audio Processing pipeline
            if (!inputAudioContextRef.current || !streamRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            // Using ScriptProcessor as per guidelines
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolumeLevel(Math.min(rms * 5, 1)); // Amplify a bit for visualizer

              const pcmBlob = createPcmBlob(inputData);
              
              // Send to API
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            const outputTrans = message.serverContent?.outputTranscription;
            const inputTrans = message.serverContent?.inputTranscription;
            
            if (outputTrans?.text) {
                currentOutputTranscription.current += outputTrans.text;
            }
            if (inputTrans?.text) {
                currentInputTranscription.current += inputTrans.text;
            }

            if (message.serverContent?.turnComplete) {
                const userText = currentInputTranscription.current;
                const aiText = currentOutputTranscription.current;
                
                if (userText.trim()) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + '-user',
                        role: 'user',
                        text: userText,
                        timestamp: new Date()
                    }]);
                }
                if (aiText.trim()) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + '-ai',
                        role: 'assistant',
                        text: aiText,
                        timestamp: new Date()
                    }]);
                }

                currentInputTranscription.current = '';
                currentOutputTranscription.current = '';
            }

            // Handle Audio Output
            if (outputAudioContextRef.current) {
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                
                if (base64Audio) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBytes = decode(base64Audio);
                const audioBuffer = await decodeAudioData(audioBytes, ctx, SAMPLE_RATE_OUTPUT, 1);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                    if (sourcesRef.current.size === 0) {
                        setVolumeLevel(0); // Reset visualizer when AI stops talking
                    }
                });

                source.start(nextStartTimeRef.current);
                sourcesRef.current.add(source);
                nextStartTimeRef.current += audioBuffer.duration;
                }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              currentOutputTranscription.current = ''; // Clear potentially incomplete text
            }
          },
          onclose: () => {
            console.log("NOVA Connection Closed");
            if (connectionState !== ConnectionState.DISCONNECTED) {
               disconnect();
            }
          },
          onerror: (err) => {
            console.error("NOVA Connection Error", err);
            setConnectionState(ConnectionState.ERROR);
            disconnect();
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to connect:", error);
      setConnectionState(ConnectionState.ERROR);
      disconnect();
    }
  }, [disconnect, connectionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    connect,
    disconnect,
    connectionState,
    volumeLevel,
    messages
  };
};
