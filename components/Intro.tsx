import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroProps {
  onComplete: () => void;
}

const HEX_CHARS = '0123456789ABCDEF';
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#';

const RandomHexBlock: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
    const [content, setContent] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            let str = '';
            for(let i=0; i<rows; i++) {
                str += Array(40).fill(0).map(() => HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]).join(' ') + '\n';
            }
            setContent(str);
        }, 50);
        return () => clearInterval(interval);
    }, [rows]);
    return <pre className="text-[8px] md:text-[10px] font-mono text-zinc-800 leading-none opacity-50 whitespace-pre-wrap">{content}</pre>;
};

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // Phase 0: Boot Sequence (0-2s)
      const loadingInterval = setInterval(() => {
        setLoadingProgress(p => {
            if (p >= 100) {
                clearInterval(loadingInterval);
                return 100;
            }
            return p + Math.random() * 5;
        });
      }, 50);

      await new Promise(r => setTimeout(r, 2500));
      setPhase(1); // "Introducing"
      
      await new Promise(r => setTimeout(r, 1500));
      setPhase(2); // "Future"
      
      await new Promise(r => setTimeout(r, 1500));
      setPhase(3); // "NOVA"
      
      await new Promise(r => setTimeout(r, 3500));
      setPhase(4); // Out
      
      await new Promise(r => setTimeout(r, 1000));
      onComplete();
    };

    sequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white cursor-none overflow-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-10 left-10">
            <RandomHexBlock rows={10} />
         </div>
         <div className="absolute bottom-10 right-10 text-right">
            <RandomHexBlock rows={5} />
         </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* PHASE 0: SYSTEM BOOT */}
        {phase === 0 && (
          <motion.div
            key="boot"
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            className="flex flex-col items-center justify-center w-64 md:w-96"
          >
            <div className="flex justify-between w-full mb-2 font-mono text-xs text-zinc-500">
                <span>SYSTEM_BOOT</span>
                <span>{Math.min(100, Math.floor(loadingProgress))}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                <motion.div 
                    className="h-full bg-white"
                    style={{ width: `${loadingProgress}%` }}
                />
            </div>
            <div className="mt-4 font-mono text-[10px] text-zinc-600 space-y-1 text-center">
                <p>LOADING NEURAL PATHWAYS...</p>
                {loadingProgress > 30 && <p>ESTABLISHING UPLINK...</p>}
                {loadingProgress > 60 && <p>CALIBRATING SENSORS...</p>}
                {loadingProgress > 90 && <p className="text-zinc-300">DONE.</p>}
            </div>
          </motion.div>
        )}

        {/* PHASE 1: INTRODUCING */}
        {phase === 1 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, letterSpacing: '20px' }}
            className="relative"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                INTRODUCING
            </h1>
            <motion.div 
                className="absolute -inset-2 bg-white/10 blur-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.2, repeat: 3 }}
            />
          </motion.div>
        )}

        {/* PHASE 2: THE FUTURE */}
        {phase === 2 && (
          <motion.div
            key="future"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
            className="flex flex-col items-center"
          >
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                className="h-[1px] bg-zinc-500 mb-4"
             />
             <h2 className="text-lg md:text-2xl font-light tracking-[0.5em] text-zinc-300">
                THE FUTURE OF AI
             </h2>
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                className="h-[1px] bg-zinc-500 mt-4"
             />
          </motion.div>
        )}

        {/* PHASE 3: NOVA REVEAL */}
        {phase === 3 && (
            <div className="relative flex items-center justify-center w-full h-full">
                {/* Shockwave */}
                <motion.div 
                    initial={{ scale: 0, opacity: 1, borderWidth: "50px" }}
                    animate={{ scale: 4, opacity: 0, borderWidth: "0px" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute rounded-full border border-white z-0"
                    style={{ width: '100px', height: '100px' }}
                />
                
                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="z-10 relative"
                >
                    <h1 className="text-[8rem] md:text-[15rem] font-black tracking-tighter leading-none text-white mix-blend-difference">
                        NOVA
                    </h1>
                    {/* Scanline overlay on text */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,black_50%)] bg-[length:100%_8px] opacity-20 pointer-events-none" />
                </motion.div>

                {/* Floating Particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ 
                            x: 0, 
                            y: 0, 
                            opacity: 1 
                        }}
                        animate={{ 
                            x: (Math.random() - 0.5) * window.innerWidth, 
                            y: (Math.random() - 0.5) * window.innerHeight, 
                            opacity: 0 
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                    />
                ))}
            </div>
        )}

      </AnimatePresence>

      {/* Persistent CRT Overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>
    </div>
  );
};