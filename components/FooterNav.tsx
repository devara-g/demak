'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FooterNavProps {
  currentSpread: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({
  currentSpread,
  onPrev,
  onNext,
  onSelect,
}) => {
  const tabs = [
    { idx: 0, label: 'Sampul Depan' },
    { idx: 1, label: 'Pembuka' },
    { idx: 2, label: 'Bab I' },
    { idx: 3, label: 'Bab II' },
    { idx: 4, label: 'Bab III 💖' },
  ];

  const getPrevText = () => {
    if (currentSpread === 0) return 'Halaman Sebelumnya';
    if (currentSpread === 1) return 'Tutup ke Sampul';
    return 'Halaman Sebelumnya';
  };

  const getNextText = () => {
    if (currentSpread === 0) return 'Buka Buku ➔';
    return 'Halaman Berikutnya';
  };

  return (
    <footer className="relative z-30 w-full max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shrink-0">
      <button
        onClick={onPrev}
        disabled={currentSpread === 0}
        type="button"
        className="px-3.5 py-1.5 rounded-full bg-[#3b1223]/90 hover:bg-[#be123c] disabled:opacity-30 disabled:pointer-events-none text-[#fce7f3] hover:text-white text-xs font-medium border border-[#f472b6]/40 flex items-center gap-1.5 transition shadow cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{getPrevText()}</span>
      </button>

      {/* Chapter Indicator Dots */}
      <div className="flex items-center gap-1.5 bg-[#240a17]/90 px-3 py-1 rounded-full border border-[#f472b6]/40 shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.idx}
            type="button"
            onClick={() => onSelect(tab.idx)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-typewriter transition cursor-pointer ${
              currentSpread === tab.idx
                ? 'bg-[#be123c] text-white font-semibold shadow-sm'
                : 'text-[#fbcfe8] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentSpread === 4}
        type="button"
        className="px-3.5 py-1.5 rounded-full bg-[#be123c] hover:bg-[#e11d48] disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-medium border border-[#fbcfe8] flex items-center gap-1.5 transition shadow cursor-pointer"
      >
        <span>{getNextText()}</span>
        {currentSpread > 0 && <ArrowRight className="w-3.5 h-3.5" />}
      </button>
    </footer>
  );
};
