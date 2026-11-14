'use client';

import React, { useEffect, useRef, useState } from 'react';
import { sound } from '@/lib/audio';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [showWoodstock, setShowWoodstock] = useState(false);
  const [woodstockChirped, setWoodstockChirped] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Create 48 ambient warm gold and romantic rose starlight particles
    const particles: Particle[] = [];
    const colors = [
      'rgba(212, 175, 55, ',   // Gold dust
      'rgba(255, 255, 255, ',  // Pure Jasmine White Blossom glow
      'rgba(254, 240, 138, ',  // Jasmine Stamen Golden glow
      'rgba(244, 114, 182, ',  // Soft Rose
      'rgba(253, 164, 175, ',  // Blush Starlight
    ];

    for (let i = 0; i < 48; i++) {
      const baseOpacity = 0.2 + Math.random() * 0.55;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1.2 + Math.random() * 2.4,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -0.15 - Math.random() * 0.35, // slow upward drift
        opacity: baseOpacity,
        baseOpacity,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.015 + Math.random() * 0.025,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Gentle mouse interaction (particles float away softly from cursor)
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist > 0) {
          const force = (90 - dist) / 90;
          p.x += (dx / dist) * force * 1.8;
          p.y += (dy / dist) * force * 1.8;
        }

        // Pulse opacity
        p.opacity = p.baseOpacity + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.25;
        p.opacity = Math.max(0.08, Math.min(0.85, p.opacity));

        // Wrap around borders
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowBlur = p.size * 3.5;
        ctx.shadowColor = p.color + '0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Trigger Woodstock companion flutter every 45s
    const woodstockTimer = setInterval(() => {
      setShowWoodstock(true);
      setTimeout(() => setShowWoodstock(false), 14000);
    }, 42000);

    // Initial appearance after 12 seconds
    const initialWoodstock = setTimeout(() => {
      setShowWoodstock(true);
      setTimeout(() => setShowWoodstock(false), 14000);
    }, 12000);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearInterval(woodstockTimer);
      clearTimeout(initialWoodstock);
    };
  }, []);

  const handleWoodstockClick = () => {
    sound.playChirpSound();
    setWoodstockChirped(true);
    setTimeout(() => setWoodstockChirped(false), 1600);
  };

  return (
    <>
      {/* Interactive Firefly / Stardust Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Cozy Vintage Reading Lamp Radial Glow (Top Left) */}
      <div
        className="fixed -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none z-0 opacity-40 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.25) 0%, rgba(212, 175, 55, 0.12) 40%, transparent 75%)',
        }}
      />

      {/* Ambient Celestial Rose Depth (Bottom Right) */}
      <div
        className="fixed -bottom-40 -right-40 w-[550px] h-[550px] rounded-full pointer-events-none z-0 opacity-35 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(225, 29, 72, 0.28) 0%, rgba(244, 63, 94, 0.14) 50%, transparent 80%)',
        }}
      />

      {/* Woodstock Flying Companion with Love Letter */}
      {showWoodstock && (
        <div
          onClick={handleWoodstockClick}
          className="fixed top-12 z-40 cursor-pointer pointer-events-auto select-none transition-transform group animate-woodstock-flight"
          style={{
            animation: 'woodstockFlyAcross 14s linear forwards',
          }}
          title="Woodstock membawa surat cinta! Klik untuk menyapa 🐤💖"
        >
          <div className="relative flex items-center gap-1.5 p-1.5 rounded-full bg-[#3b1223]/80 border border-[#f472b6]/60 shadow-lg backdrop-blur-xs hover:scale-110 active:scale-95 transition-transform">
            <span className="text-xl inline-block -rotate-6 animate-bounce">🐤</span>
            <span className="text-xs">💌</span>
            {woodstockChirped && (
              <span className="absolute -top-6 left-1 text-[11px] font-bold text-yellow-300 animate-fade-in drop-shadow whitespace-nowrap">
                Chirp! ♪ 💖
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

