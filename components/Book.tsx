'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';
import { BookmarkDrawer } from './BookmarkDrawer';
import {
  CoverLeft,
  CoverRight,
  Chapter1Left,
  Chapter1Right,
  Chapter2Left,
  Chapter2Right,
  Chapter3Left,
  Chapter3Right,
} from './pages/Pages';

interface BookProps {
  state: BookState;
  onChangeSpread: (index: number) => void;
  onAccept: () => void;
  showToast: (msg: string) => void;
}

export const Book: React.FC<BookProps> = ({
  state,
  onChangeSpread,
  onAccept,
  showToast,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [flippingState, setFlippingState] = useState<{
    active: boolean;
    from: number;
    to: number;
    direction: 'next' | 'prev';
  }>({
    active: false,
    from: 0,
    to: 0,
    direction: 'next',
  });

  const getPageL = (spreadIdx: number) => {
    switch (spreadIdx) {
      case 0:
        return <CoverLeft state={state} />;
      case 1:
        return <Chapter1Left state={state} />;
      case 2:
        return <Chapter2Left state={state} />;
      case 3:
        return <Chapter3Left state={state} />;
      default:
        return null;
    }
  };

  const getPageR = (spreadIdx: number) => {
    switch (spreadIdx) {
      case 0:
        return <CoverRight state={state} onOpenBook={() => flipTo(1)} />;
      case 1:
        return <Chapter1Right state={state} />;
      case 2:
        return <Chapter2Right state={state} />;
      case 3:
        return <Chapter3Right state={state} onAccept={onAccept} showToast={showToast} />;
      default:
        return null;
    }
  };

  const flipTo = (targetIdx: number) => {
    const target = Math.max(0, Math.min(3, targetIdx));
    if (target === state.currentSpread || flippingState.active) return;

    sound.playPaperTurnSound();
    const isNext = target > state.currentSpread;

    setFlippingState({
      active: true,
      from: state.currentSpread,
      to: target,
      direction: isNext ? 'next' : 'prev',
    });

    // Complete flip animation after 620ms
    setTimeout(() => {
      onChangeSpread(target);
      setFlippingState({
        active: false,
        from: target,
        to: target,
        direction: 'next',
      });
    }, 620);
  };

  return (
    <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-center min-h-0 [perspective:2500px]">
      {/* Soft Ambient Desk Shadow */}
      <div className="absolute -bottom-5 left-8 right-8 h-12 bg-black/65 blur-2xl rounded-full pointer-events-none" />

      {/* Hardcover Casing */}
      <div className="relative w-full h-full max-h-[595px] sm:max-h-[625px] bg-[#0e1d32] p-2.5 sm:p-3.5 rounded-2xl shadow-book border border-[#d4af37]/35 flex flex-col justify-between">
        {/* Double Gold Fillet Inset Line */}
        <div className="absolute inset-1.5 border border-[#d4af37]/30 rounded-xl pointer-events-none" />

        {/* Antique Brass Corner Guards */}
        <div className="absolute top-1 left-1 w-8 h-8 border-t-2 border-l-2 border-[#d4af37] rounded-tl-lg pointer-events-none" />
        <div className="absolute top-1 right-1 w-8 h-8 border-t-2 border-r-2 border-[#d4af37] rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-8 h-8 border-b-2 border-l-2 border-[#d4af37] rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-8 h-8 border-b-2 border-r-2 border-[#d4af37] rounded-br-lg pointer-events-none" />

        {/* Stacked Paper Block Edges (Showing Real Physical Book Thickness) */}
        <div className="absolute -right-2 top-3 bottom-3 w-2.5 bg-gradient-to-r from-[#dcd1bd] via-[#f7f0e3] to-[#e6dbc8] rounded-r border-r border-[#c2b49d] shadow-sm pointer-events-none" />
        <div className="absolute -bottom-2 left-4 right-4 h-2.5 bg-gradient-to-b from-[#dcd1bd] via-[#f7f0e3] to-[#e6dbc8] rounded-b border-b border-[#c2b49d] shadow-sm pointer-events-none" />

        {/* Headband Fabric (Kain Tenun Pembatas Buku) */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#1d4ed8] via-[#d4af37] to-[#1d4ed8] rounded-full shadow pointer-events-none" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#1d4ed8] via-[#d4af37] to-[#1d4ed8] rounded-full shadow pointer-events-none" />

        {/* Silk Ribbon Bookmark Tab */}
        <button
          type="button"
          onClick={() => {
            sound.playPaperTurnSound();
            setIsDrawerOpen(!isDrawerOpen);
          }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-12 bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#1e40af] shadow-md z-30 rounded-t-sm hover:translate-y-1 transition-transform group cursor-pointer"
          title="Klik untuk membuka Pembatas Buku & Daftar Isi"
        >
          <div className="absolute -bottom-2 left-0 w-0 h-0 border-l-[12px] border-l-[#1e40af] border-r-[12px] border-r-[#1e40af] border-b-[8px] border-b-transparent" />
        </button>

        {/* Inner Pages Open Shell */}
        <div className="relative w-full h-full bg-[#fbf7ee] rounded-lg overflow-hidden shadow-inner flex min-h-0 [transform-style:preserve-3d]">
          {/* Central Book Binding Gutter Shadow */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-transparent via-[#0f1d2e]/20 to-transparent pointer-events-none z-20" />

          {/* STATIC BASE PAGES */}
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 min-h-0 relative z-10">
            {/* Left Static Side */}
            <div className="h-full relative overflow-hidden">
              {flippingState.active && flippingState.direction === 'prev'
                ? getPageL(flippingState.to)
                : getPageL(state.currentSpread)}
            </div>

            {/* Right Static Side */}
            <div className="h-full relative overflow-hidden">
              {flippingState.active && flippingState.direction === 'next'
                ? getPageR(flippingState.to)
                : getPageR(state.currentSpread)}
            </div>
          </div>

          {/* 3D TURNING PAGE LEAF (Physical Flipping Layer) */}
          <AnimatePresence>
            {flippingState.active && flippingState.direction === 'next' && (
              <motion.div
                key="leaf-next"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                exit={{ rotateY: -180 }}
                transition={{ duration: 0.62, ease: [0.25, 1, 0.5, 1] }}
                className="absolute top-0 right-0 w-1/2 h-full z-30 pointer-events-none [transform-origin:0%_50%] [transform-style:preserve-3d]"
              >
                {/* Front Face of Turning Leaf (Old Right Page) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] overflow-hidden bg-[#fbf7ee] shadow-2xl">
                  {getPageR(flippingState.from)}
                  {/* Dynamic Shading Gradient */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.45, 0.1] }}
                    transition={{ duration: 0.62 }}
                    className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none"
                  />
                </div>

                {/* Back Face of Turning Leaf (New Left Page) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden bg-[#fbf7ee] shadow-2xl">
                  {getPageL(flippingState.to)}
                  {/* Dynamic Landing Shading Gradient */}
                  <motion.div
                    initial={{ opacity: 0.45 }}
                    animate={{ opacity: [0.45, 0] }}
                    transition={{ duration: 0.62 }}
                    className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-transparent pointer-events-none"
                  />
                </div>
              </motion.div>
            )}

            {flippingState.active && flippingState.direction === 'prev' && (
              <motion.div
                key="leaf-prev"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                exit={{ rotateY: 180 }}
                transition={{ duration: 0.62, ease: [0.25, 1, 0.5, 1] }}
                className="absolute top-0 left-0 w-1/2 h-full z-30 pointer-events-none [transform-origin:100%_50%] [transform-style:preserve-3d]"
              >
                {/* Front Face of Turning Leaf (Old Left Page) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] overflow-hidden bg-[#fbf7ee] shadow-2xl">
                  {getPageL(flippingState.from)}
                  {/* Dynamic Shading Gradient */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.45, 0.1] }}
                    transition={{ duration: 0.62 }}
                    className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent pointer-events-none"
                  />
                </div>

                {/* Back Face of Turning Leaf (New Right Page) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(-180deg)] overflow-hidden bg-[#fbf7ee] shadow-2xl">
                  {getPageR(flippingState.to)}
                  {/* Dynamic Landing Shading Gradient */}
                  <motion.div
                    initial={{ opacity: 0.45 }}
                    animate={{ opacity: [0.45, 0] }}
                    transition={{ duration: 0.62 }}
                    className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Dog-Ear Page Corners (Real Corner Curl on Hover) */}
          {!flippingState.active && state.currentSpread < 3 && (
            <button
              onClick={() => flipTo(state.currentSpread + 1)}
              type="button"
              className="absolute bottom-0 right-0 w-12 h-12 z-20 flex items-end justify-end p-2 text-xs text-[#3b6ea5] hover:text-[#1e40af] font-typewriter cursor-pointer transition-all duration-200 group"
              title="Balik ke Halaman Berikutnya ➔"
            >
              {/* Folded paper corner geometry */}
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[28px] border-b-[#f4eee1] border-l-[28px] border-l-transparent drop-shadow-md group-hover:border-b-[36px] group-hover:border-l-[36px] transition-all" />
              <span className="relative z-10 font-bold group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">➔</span>
            </button>
          )}

          {!flippingState.active && state.currentSpread > 0 && (
            <button
              onClick={() => flipTo(state.currentSpread - 1)}
              type="button"
              className="absolute bottom-0 left-0 w-12 h-12 z-20 flex items-end justify-start p-2 text-xs text-[#3b6ea5] hover:text-[#1e40af] font-typewriter cursor-pointer transition-all duration-200 group"
              title="⬅ Balik ke Halaman Sebelumnya"
            >
              {/* Folded paper corner geometry */}
              <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[28px] border-b-[#f4eee1] border-r-[28px] border-r-transparent drop-shadow-md group-hover:border-b-[36px] group-hover:border-r-[36px] transition-all" />
              <span className="relative z-10 font-bold group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform">⬅</span>
            </button>
          )}
        </div>
      </div>

      {/* Bookmark Quick Drawer */}
      <BookmarkDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onJumpTo={flipTo}
        currentSpread={state.currentSpread}
      />
    </main>
  );
};
