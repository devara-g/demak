'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookState, defaultBookState } from '@/types';
import { Header } from '@/components/Header';
import { FlipBook, FlipBookRef } from '@/components/FlipBook';
import { FooterNav } from '@/components/FooterNav';
import { CustomizeModal } from '@/components/CustomizeModal';
import { AmbientBackground } from '@/components/AmbientBackground';

export default function Home() {
  const [state, setState] = useState<BookState>(defaultBookState);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const flipBookRef = useRef<FlipBookRef>(null);

  // Load state from localStorage on mount with migration to Pink Romance
  useEffect(() => {
    try {
      const savedPink = localStorage.getItem('snoopy_pink_romance_v2');
      const savedLegacy = localStorage.getItem('snoopy_blue_confession_v1');
      const saved = savedPink || savedLegacy;

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bookTitle && parsed.bookTitle.includes('Langit Biru')) {
          parsed.bookTitle = 'Tentang Kamu & Nuansa Pink';
        }
        if (!parsed.whatsappNumber || parsed.whatsappNumber === '6281234567890') {
          parsed.whatsappNumber = '6281221995470';
        }
        if (!parsed.recipient || parsed.recipient === 'Seseorang Spesial') {
          parsed.recipient = 'Jasmine ramadhania syarif';
        }
        setState((prev) => ({
          ...prev,
          ...parsed,
          currentSpread: 0,
        }));
        localStorage.setItem(
          'snoopy_pink_romance_v2',
          JSON.stringify({ ...defaultBookState, ...parsed, currentSpread: 0 })
        );
        if (savedLegacy) {
          localStorage.removeItem('snoopy_blue_confession_v1');
        }
      }
    } catch (err) {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSaveCustomize = (updates: Partial<BookState>) => {
    const nextState = { ...state, ...updates };
    setState(nextState);
    try {
      localStorage.setItem('snoopy_pink_romance_v2', JSON.stringify(nextState));
    } catch (err) {}
    showToast('Buku berhasil disesuaikan 💖');
  };

  const handleResetCustomize = () => {
    setState((prev) => ({
      ...defaultBookState,
      currentSpread: prev.currentSpread,
    }));
    try {
      localStorage.removeItem('snoopy_pink_romance_v2');
      localStorage.removeItem('snoopy_blue_confession_v1');
    } catch (err) {}
    showToast('Teks dikembalikan ke awal 🌸');
  };

  const handleAcceptConfession = () => {
    const nextState = { ...state, accepted: true };
    setState(nextState);
    try {
      localStorage.setItem('snoopy_pink_romance_v2', JSON.stringify(nextState));
    } catch (err) {}
  };

  const handleChangeSpread = (targetIdx: number) => {
    const bounded = Math.max(0, Math.min(4, targetIdx));
    setState((prev) => ({ ...prev, currentSpread: bounded }));
  };

  const handleNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.flipNext();
    } else {
      handleChangeSpread(state.currentSpread + 1);
    }
  };

  const handlePrev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.flipPrev();
    } else {
      handleChangeSpread(state.currentSpread - 1);
    }
  };

  const handleSelect = (idx: number) => {
    if (flipBookRef.current) {
      flipBookRef.current.flipToSpread(idx);
    } else {
      handleChangeSpread(idx);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (state.currentSpread < 3) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (state.currentSpread > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentSpread]);

  return (
    <>
      <AmbientBackground />

      <Header
        state={state}
        onOpenCustomize={() => setIsCustomizeOpen(true)}
        showToast={showToast}
      />

      <FlipBook
        ref={flipBookRef}
        state={state}
        onSpreadChange={handleChangeSpread}
        onAccept={handleAcceptConfession}
        showToast={showToast}
        externalSpread={state.currentSpread}
      />

      <FooterNav
        currentSpread={state.currentSpread}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelect={handleSelect}
      />

      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        state={state}
        onSave={handleSaveCustomize}
        onReset={handleResetCustomize}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#3b1223]/95 text-[#fce7f3] text-xs border border-[#f472b6]/60 shadow-xl shadow-rose-950/40 backdrop-blur-sm animate-fade-in font-medium">
          {toastMessage}
        </div>
      )}
    </>
  );
}
