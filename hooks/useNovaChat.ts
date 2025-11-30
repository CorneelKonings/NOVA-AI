import { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

export const useNovaChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: "Greetings. I am NOVA. I am ready to explore the universe with you. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !process.env.API_KEY) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      // Initialize chat if not exists
      if (!chatSessionRef.current) {
        const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = client.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are NOVA, a futuristic, highly intelligent, and helpful AI assistant. You speak with a calm, precise, and slightly sci-fi tone. You are concise but profound. You love space, technology, and the future.",
          },
        });
      }

      const result = await chatSessionRef.current.sendMessage({ message: text });
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: result.text,
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: "I am experiencing a communication error. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return { chatMessages, sendMessage, isChatLoading };
};