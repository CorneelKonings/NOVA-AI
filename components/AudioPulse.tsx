import React from 'react';
import { motion } from 'framer-motion';

interface AudioPulseProps {
  active: boolean;
  volume: number; // 0 to 1
}

export const AudioPulse: React.FC<AudioPulseProps> = ({ active, volume }) => {
  // Create 5 bars
  const bars = [0, 1, 2, 3, 4];

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((i) => {
        // Calculate dynamic height based on volume and index
        // Center bars are taller
        const baseHeight = active ? 20 : 4;
        const variableHeight = active ? volume * 50 : 0; 
        
        // Randomize slightly for organic feel
        const randomFactor = active ? Math.random() * 10 : 0;
        
        return (
            <motion.div
                key={i}
                className={`w-2 rounded-full ${active ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-zinc-800'}`}
                animate={{
                    height: Math.max(4, baseHeight + variableHeight + randomFactor),
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
            />
        );
      })}
    </div>
  );
};