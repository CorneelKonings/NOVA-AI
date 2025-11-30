import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
}

export const StarField: React.FC<{ speed?: number }> = ({ speed = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      for (let i = 0; i < 800; i++) {
        starsRef.current.push({
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          z: Math.random() * width, // Depth
          size: Math.random() * 2,
        });
      }
    };
    initStars();

    const animate = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Darker trails for sharper look
      ctx.fillRect(0, 0, width, height);

      // Center origin
      const cx = width / 2;
      const cy = height / 2;

      starsRef.current.forEach((star) => {
        // Move star closer
        star.z -= speed * 2; 

        // Reset if it passes screen
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        // Project 3D position to 2D
        const x = (star.x / star.z) * width + cx;
        const y = (star.y / star.z) * height + cy;
        const size = (1 - star.z / width) * star.size * 2;

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          const brightness = 1 - star.z / width;
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};