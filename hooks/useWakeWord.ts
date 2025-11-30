import { useEffect, useRef, useState } from 'react';

export const useWakeWord = (onWake: () => void, isEnabled: boolean) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support (Chrome, Safari, Edge)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    // Flag to prevent restarts after cleanup
    let isCurrentEffectActive = true;

    if (isEnabled) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
           const transcript = event.results[i][0].transcript.trim().toLowerCase();
           console.log("Wake word listener heard:", transcript);

           // Expanded list of triggers including common misinterpretations
           const triggers = [
             'hey nova', 'hi nova', 'hello nova', 'okay nova', 'ok nova',
             'hey noah', 'hi noah', 'hello noah',
             'hey nola', 'hey nov', 'hey no va', 'hey know a',
             'hey lover', 'hey rover', // Common phonetic slip-ups
             'start nova', 'wake up nova', 'activate nova',
             'hey over' // Sometimes "nova" is heard as "over"
           ];

           // Check for exact matches or inclusions
           const detected = triggers.some(trigger => transcript.includes(trigger));
           
           // Also strict check for just "nova" if it appears clearly
           const isNova = transcript.includes('nova') || transcript === 'nova';

           if (detected || isNova) {
             console.log('Wake word detected:', transcript);
             recognition.stop();
             onWake();
             return;
           }
        }
      };

      recognition.onend = () => {
         // Only restart if the effect is still active and we are supposed to be enabled
         if (isCurrentEffectActive && isEnabled) {
            console.log("Wake word listener restarting...");
            try {
              recognition.start();
            } catch (e) {
              // Ignore errors (like "already started")
            }
         } else {
            if (isCurrentEffectActive) setIsListening(false);
         }
      };

      recognition.onerror = (event: any) => {
          if (event.error === 'aborted' || event.error === 'no-speech') {
             // Ignore benign errors
             return;
          }
          console.debug("Wake word error:", event.error);
      };

      recognitionRef.current = recognition;
      
      // Delay start slightly to ensure previous instances are cleared
      const startTimeout = setTimeout(() => {
          if (!isCurrentEffectActive) return;
          try {
            recognition.start();
            setIsListening(true);
            console.log("Wake word listener started");
          } catch (e) {
            // console.error("Wake word start error", e);
          }
      }, 100);

      return () => {
        isCurrentEffectActive = false;
        clearTimeout(startTimeout);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
        }
        setIsListening(false);
      };

    } else {
      // Cleanup if disabled
      setIsListening(false);
      return () => {
         isCurrentEffectActive = false;
      };
    }
  }, [isEnabled, onWake]);

  return { isListening };
};