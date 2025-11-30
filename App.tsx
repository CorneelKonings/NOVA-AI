import React, { useState } from 'react';
import { StarField } from './components/StarField';
import { Intro } from './components/Intro';
import { NovaInterface } from './components/NovaInterface';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [warpSpeed, setWarpSpeed] = useState(0.2);
  
  const handleIntroComplete = () => {
    setShowIntro(false);
    setWarpSpeed(1); // Cruising speed
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden font-sans">
      {/* Background is always present but accelerates after intro */}
      <StarField speed={showIntro ? (warpSpeed === 0.2 ? 0.5 : 20) : 0.8} />

      {showIntro ? (
        <Intro onComplete={handleIntroComplete} />
      ) : (
        <div className="animate-in fade-in duration-1000">
          <NovaInterface />
        </div>
      )}
      
      {/* Attribution */}
      {!showIntro && (
        <div className="fixed top-4 right-6 text-right pointer-events-none hidden md:block">
            <p className="text-[10px] text-zinc-700 font-mono tracking-widest">GEMINI // 2.5 // FLASH</p>
        </div>
      )}
    </div>
  );
};

export default App;
