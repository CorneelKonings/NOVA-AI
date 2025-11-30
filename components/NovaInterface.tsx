import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Power, MessageSquare, Box, ExternalLink, Activity, Send, Terminal, Sparkles, Cpu } from 'lucide-react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useNovaChat } from '../hooks/useNovaChat';
import { ConnectionState } from '../types';
import { AudioPulse } from './AudioPulse';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'voice' | 'chat' | 'projects';

export const NovaInterface: React.FC = () => {
  // Voice Hook
  const { connect, disconnect, connectionState, volumeLevel, messages: liveMessages } = useGeminiLive();
  // Chat Hook
  const { chatMessages, sendMessage, isChatLoading } = useNovaChat();

  const [viewMode, setViewMode] = useState<ViewMode>('voice');
  const [isMuted, setIsMuted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, viewMode]);

  const handleToggleConnection = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect();
      setViewMode('voice');
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (chatInput.trim()) {
        sendMessage(chatInput);
        setChatInput('');
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-screen w-full overflow-hidden bg-transparent font-sans">
      
      {/* Header / Status */}
      <div className="flex justify-between items-center p-6 z-20">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse shadow-[0_0_10px_white]' : 'bg-zinc-600'}`} />
            <span className="text-xs font-mono text-zinc-300 tracking-wider">
                {isConnected ? 'NOVA: VOICE ONLINE' : 'NOVA: STANDBY'}
            </span>
        </div>
        <div className="font-mono text-xs text-zinc-500 tracking-[0.2em] flex items-center gap-2">
            <Sparkles size={10} />
            NOVA AI v2.5
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
            
            {/* --- VIEW: VOICE MODE --- */}
            {viewMode === 'voice' && (
                <motion.div 
                    key="voice"
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    className="flex flex-col items-center justify-center w-full h-full"
                >
                    {/* Visualizer Ring */}
                    <div className="relative flex items-center justify-center">
                        <motion.div 
                            animate={{ rotate: isConnected ? 360 : 0 }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            className={`w-64 h-64 md:w-96 md:h-96 rounded-full border border-dashed border-zinc-800 ${isConnected ? 'border-zinc-600 opacity-100' : 'opacity-30'}`}
                        />
                         <motion.div 
                            animate={{ rotate: isConnected ? -360 : 0 }}
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            className={`absolute w-[18rem] h-[18rem] md:w-[26rem] md:h-[26rem] rounded-full border border-dotted border-zinc-800 ${isConnected ? 'opacity-50' : 'opacity-10'}`}
                        />
                        
                        {/* Core */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-full border border-zinc-800 shadow-2xl z-10">
                                <AudioPulse active={isConnected} volume={volumeLevel} />
                                {isConnected && (
                                    <div className="absolute inset-0 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.1)] animate-pulse pointer-events-none" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Live Transcript (Mini) */}
                    {isConnected && liveMessages.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-32 md:bottom-40 max-w-md text-center px-6"
                        >
                            <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                                "{liveMessages[liveMessages.length - 1].text}"
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* --- VIEW: CHAT MODE --- */}
            {viewMode === 'chat' && (
                <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-3xl h-[80vh] flex flex-col p-4 md:p-0 pb-24"
                >
                    {/* Chat Window */}
                    <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden flex flex-col relative shadow-2xl">
                        {/* Header */}
                        <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50 justify-between">
                            <span className="text-xs font-mono text-zinc-500">SECURE CHANNEL // ENCRYPTED</span>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                                <div className="w-2 h-2 rounded-full bg-green-500/20" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {chatMessages.map((msg) => (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-white text-black rounded-tr-sm' 
                                            : 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50 rounded-tl-sm'
                                    }`}>
                                        <div className="text-[9px] uppercase tracking-widest opacity-50 mb-2 flex items-center gap-1 font-mono">
                                            {msg.role === 'assistant' && <Terminal size={10} />}
                                            {msg.role === 'assistant' ? 'NOVA AI' : 'USER'}
                                        </div>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-800/30 p-4 rounded-xl rounded-tl-sm border border-zinc-800 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75" />
                                        <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message to NOVA..."
                                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder-zinc-600"
                                    autoFocus
                                />
                                <button 
                                    type="submit" 
                                    disabled={!chatInput.trim() || isChatLoading}
                                    className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                                
                                {/* Bottom Glow Line on Focus */}
                                <div className="absolute bottom-[-16px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* --- VIEW: PROJECTS MODE --- */}
            {viewMode === 'projects' && (
                <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-4xl h-full flex flex-col items-center justify-start pt-10 px-4 overflow-y-auto pb-32"
                >
                    <h2 className="text-4xl font-light tracking-[0.2em] mb-12 text-center text-white mix-blend-difference">PROJECT ARCHIVE</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full pb-20">
                        {/* NIGHTNOTE CARD */}
                        <motion.div 
                            whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.8)' }}
                            className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-sm transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Activity size={20} className="text-white" />
                            </div>
                            
                            <div className="mb-6">
                                <span className="inline-block px-2 py-1 text-[10px] font-mono border border-white/20 rounded text-zinc-400 mb-2">ALPHA BUILD</span>
                                <h3 className="text-2xl font-bold tracking-tight text-white mb-2">NIGHTNOTE</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Our newest project. The future of dark mode note taking. 
                                    Minimalist, secure, and designed for the night.
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-8">
                                <div className="h-[1px] flex-1 bg-zinc-800 mr-4 group-hover:bg-zinc-600 transition-colors" />
                                <a 
                                    href="https://night-note-alpha.vercel.app" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold tracking-widest hover:bg-zinc-200 transition-colors rounded-sm"
                                >
                                    ACCESS <ExternalLink size={12} />
                                </a>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Coming Soon Card */}
                         <div className="rounded-xl border border-dashed border-zinc-800 bg-transparent p-8 flex flex-col items-center justify-center opacity-50 min-h-[250px]">
                            <span className="text-xs font-mono text-zinc-600 tracking-widest mb-2">SYSTEM OFFLINE</span>
                            <span className="text-zinc-700 font-mono text-sm">More projects coming soon...</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Control Dock (Bottom) */}
      <div className="h-24 w-full flex items-center justify-center gap-12 pb-6 z-30 bg-gradient-to-t from-black via-black/95 to-transparent">
          
          {/* CHAT BUTTON */}
          <button 
             onClick={() => setViewMode('chat')}
             className={`group flex flex-col items-center gap-2 transition-all duration-300 ${viewMode === 'chat' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
             <div className={`p-3 rounded-2xl transition-all duration-300 ${viewMode === 'chat' ? 'bg-zinc-800 border-zinc-600' : 'bg-transparent border-transparent'}`}>
                <MessageSquare size={24} strokeWidth={1.5} />
             </div>
             <span className="text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 pointer-events-none">CHAT</span>
          </button>

          {/* MAIN VOICE / CONNECT BUTTON */}
          <button
            onClick={handleToggleConnection}
            className={`
                group relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500
                ${isConnected 
                    ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105' 
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-white hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'}
            `}
          >
             {isConnected ? <Power size={24} /> : <Cpu size={24} />}
             
             {/* Pulse Ring when speaking */}
             {isConnected && volumeLevel > 0.1 && (
                <div className="absolute inset-0 rounded-full border border-white/50 animate-ping" />
             )}
          </button>

          {/* PROJECTS BUTTON */}
          <button 
             onClick={() => setViewMode('projects')}
             className={`group flex flex-col items-center gap-2 transition-all duration-300 ${viewMode === 'projects' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
             <div className={`p-3 rounded-2xl transition-all duration-300 ${viewMode === 'projects' ? 'bg-zinc-800 border-zinc-600' : 'bg-transparent border-transparent'}`}>
                <Box size={24} strokeWidth={1.5} />
             </div>
             <span className="text-[10px] font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 pointer-events-none">WORK</span>
          </button>
      </div>

    </div>
  );
};