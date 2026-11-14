'use client';

import React from 'react';
import { Bookmark, X } from 'lucide-react';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpTo: (index: number) => void;
  currentSpread: number;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({
  isOpen,
  onClose,
  onJumpTo,
  currentSpread,
}) => {
  if (!isOpen) return null;

  const chapters = [
    { idx: 0, title: '0. Sampul Depan', page: 'SAMPUL' },
    { idx: 1, title: '1. Pembuka & Vinyl Adu Rayu', page: 'HAL. 00-01' },
    { idx: 2, title: '2. Bab I: Foto Spesial & Puisi', page: 'HAL. 02-03' },
    { idx: 3, title: '3. Bab II: Sastra & Wishlist', page: 'HAL. 04-05' },
    { idx: 4, title: '4. Bab III: Will You Be Mine? 💖', page: 'HAL. 06-07' },
  ];

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#fff1f2] border-2 border-[#f472b6] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4 w-80 text-xs font-typewriter animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-[#be123c]" />
          <strong className="font-serif text-[#831843] text-xs font-bold">DAFTAR ISI & PENANDA</strong>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="text-[#9d174d] hover:text-[#be123c] font-bold p-1 rounded cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1 font-typewriter text-[11px]">
        {chapters.map((ch) => (
          <button
            key={ch.idx}
            type="button"
            onClick={() => {
              onJumpTo(ch.idx);
              onClose();
            }}
            className={`w-full text-left p-2 rounded transition flex justify-between items-center cursor-pointer ${
              currentSpread === ch.idx
                ? 'bg-[#fce7f3] text-[#be123c] font-bold'
                : 'hover:bg-[#fff1f2] text-[#4c0519]'
            }`}
          >
            <span>{ch.title}</span>
            <span className="text-[#9d174d] text-[10px]">{ch.page}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
