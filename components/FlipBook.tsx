'use client';

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Image from 'next/image';
import { PageFlip } from 'page-flip';
import { BookState } from '@/types';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';
import {
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Heart,
  Play,
  Pause,
  Music,
  Sparkles,
  MessageCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { BookmarkDrawer } from './BookmarkDrawer';

export interface FlipBookRef {
  flipNext: () => void;
  flipPrev: () => void;
  flipToSpread: (spreadIndex: number) => void;
  openBook: () => void;
  closeBook: () => void;
}

interface FlipBookProps {
  state: BookState;
  onSpreadChange: (spreadIndex: number) => void;
  onAccept: () => void;
  showToast: (msg: string) => void;
  externalSpread?: number;
}

const typewriterLines = [
  '"Sebenarnya tiap kali notifikasi chat darimu masuk, jantungku selalu salah tingkah sendiri..."',
  '"Kadang aku sengaja balas chat agak cepat, karena emang sesenang itu ngobrol sama kamu."',
  '"Di bawah langit yang sama, walaupun kita belum pernah ketemu langsung, pikiranku selalu pulang ke kamu."',
  '"Kalau ada seribu draf surat cinta di meja ini, semuanya tetap bermuara ke satu nama: kamu."',
];

const shyResponses = [
  'Eh, jangan malu-malu... Snoopy udah rapi bawa bunga mawar pink nih 🐾💖',
  'Woodstock aja udah siapin confetti buat kita! Klik tombol Iya yaa ✨🐤',
  'Aku beneran tulus dari hati yang paling dalam... Yuk melangkah berdua! 🌸',
  'Snoopy ikutan deg-degan nungguin jawabanmu... 🙈💓',
  'Tenang, aku bakal jaga hatimu baik-baik setiap hari! 💌',
];

const spreadToPage = (spreadIndex: number): number => {
  if (spreadIndex <= 0) return 0;
  if (spreadIndex >= 4) return 7;
  return (spreadIndex - 1) * 2 + 1;
};

const pageToSpread = (pageIndex: number): number => {
  if (pageIndex <= 0) return 0;
  if (pageIndex >= 7) return 4;
  return Math.floor((pageIndex - 1) / 2) + 1;
};

export const FlipBook = forwardRef<FlipBookRef, FlipBookProps>(function FlipBook(
  { state, onSpreadChange, onAccept, showToast, externalSpread },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsWideScreen(window.innerWidth >= 640);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Audio / Vinyl State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(208); // 3m 28s for Adu Rayu

  // Typewriter
  const [lineIdx, setLineIdx] = useState(0);
  const [typedText, setTypedText] = useState(typewriterLines[0]);
  const [isTyping, setIsTyping] = useState(false);

  // Wishlist & Confession
  const [wishlistChecked, setWishlistChecked] = useState([true, true, true]);
  const [coupleGoal, setCoupleGoal] = useState('Makan di warung langganan hangat kuah dan sambal');
  const [selectedMood, setSelectedMood] = useState('Senyum-senyum sendiri');
  const [replyText, setReplyText] = useState('Iya, aku mau! Mulai hari ini kita pacaran ya.');
  const [shyIdx, setShyIdx] = useState(0);
  const [shyPrompt, setShyPrompt] = useState('Snoopy menatap penuh harap menunggumu...');
  const [copied, setCopied] = useState(false);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Prevent any typing or clicking on the textarea from triggering a book flip
  useEffect(() => {
    const el = replyTextareaRef.current;
    if (!el) return;
    const stopEvents = (e: Event) => {
      e.stopPropagation();
    };
    const evts = ['mousedown', 'touchstart', 'touchend', 'pointerdown', 'click', 'keydown', 'keyup', 'keypress', 'focus'];
    evts.forEach((evt) => el.addEventListener(evt, stopEvents, { passive: false }));
    return () => {
      evts.forEach((evt) => el.removeEventListener(evt, stopEvents));
    };
  }, []);

  // Polaroid Lightbox
  const [selectedPolaroid, setSelectedPolaroid] = useState<{
    src: string;
    caption: string;
    chapter: string;
  } | null>(null);

  // Initialize PageFlip
  const initPageFlip = () => {
    if (!containerRef.current || pageFlipRef.current) return;
    if (containerRef.current.offsetWidth < 200) return;

    try {
      const pageFlip = new PageFlip(containerRef.current, {
        width: 480,
        height: 600,
        size: 'stretch',
        minWidth: 260,
        maxWidth: 620,
        minHeight: 380,
        maxHeight: 750,
        maxShadowOpacity: 0.35,
        showCover: true,
        mobileScrollSupport: false,
        flippingTime: 850,
        useMouseEvents: true,
        clickEventForward: true,
        usePortrait: true,
        startPage: spreadToPage(state.currentSpread),
      });

      const pages = containerRef.current.querySelectorAll<HTMLElement>('.book-page-leaf');
      if (pages.length > 0) {
        pageFlip.loadFromHTML(pages);
        pageFlipRef.current = pageFlip;

        // Prevent inputs, textareas, and interactive cards from triggering page flip
        try {
          const ui = (pageFlip as any).getUI?.();
          if (ui && typeof ui.checkTarget === 'function') {
            const origCheck = ui.checkTarget.bind(ui);
            ui.checkTarget = (target: HTMLElement) => {
              if (!target) return true;
              const tag = target.tagName ? target.tagName.toLowerCase() : '';
              if (['textarea', 'input', 'select', 'button', 'a', 'label'].includes(tag)) {
                return false;
              }
              if (target.closest?.('textarea, input, select, button, a, [data-no-flip="true"]')) {
                return false;
              }
              return origCheck(target);
            };
          }
        } catch (e) {
          console.warn('Could not patch PageFlip checkTarget:', e);
        }

        pageFlip.on('flip', (e) => {
          const pageIndex = e.data as number;
          const currentSpread = pageToSpread(pageIndex);
          onSpreadChange(currentSpread);
        });

        pageFlip.on('changeState', (e) => {
          if (e.data === 'flipping') {
            setIsFlipping(true);
            sound.playPaperTurnSound();
          } else if (e.data === 'read') {
            setIsFlipping(false);
          }
        });
      }
    } catch (err) {
      console.error('Error initializing PageFlip:', err);
    }
  };

  useEffect(() => {
    if (!containerRef.current || pageFlipRef.current) return;
    const timer = setTimeout(() => {
      initPageFlip();
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (pageFlipRef.current) {
        try {
          (pageFlipRef.current as any).update();
        } catch (e) { }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync external spread changes
  useEffect(() => {
    if (pageFlipRef.current) {
      const curPage = pageFlipRef.current.getCurrentPageIndex();
      const targetPage = spreadToPage(state.currentSpread);
      if (pageToSpread(curPage) !== state.currentSpread) {
        try {
          pageFlipRef.current.flip(targetPage, 'bottom');
        } catch (e) {
          pageFlipRef.current.turnToPage(targetPage);
        }
      }
    }
  }, [state.currentSpread]);

  // Audio synchronization
  useEffect(() => {
    const unsubTime = sound.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      if (dur > 0) setDuration(dur);
    });
    const unsubMusic = sound.onMusicChange((playing: boolean) => {
      setIsAudioPlaying(playing);
    });
    return () => {
      unsubTime();
      unsubMusic();
    };
  }, []);

  const toggleVinylAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = sound.toggleBGM('/assets/adu_rayu.mp3');
    setIsAudioPlaying(nextState);
    if (nextState) {
      showToast('Memutar: Adu Rayu — Yovie, Tulus, Glenn 🎵');
    } else {
      showToast('Musik dijeda ⏸️');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    sound.seekBGM(newTime);
  };

  // Keyboard Escape for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPolaroid) {
        sound.playPaperTurnSound();
        setSelectedPolaroid(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPolaroid]);

  useImperativeHandle(
    ref,
    () => ({
      flipNext: () => {
        if (pageFlipRef.current) {
          sound.playPaperTurnSound();
          try {
            pageFlipRef.current.flipNext('bottom');
          } catch (e) {
            pageFlipRef.current.turnToNextPage();
          }
        }
      },
      flipPrev: () => {
        if (pageFlipRef.current) {
          sound.playPaperTurnSound();
          try {
            pageFlipRef.current.flipPrev('bottom');
          } catch (e) {
            pageFlipRef.current.turnToPrevPage();
          }
        }
      },
      flipToSpread: (target: number) => {
        if (pageFlipRef.current) {
          sound.playPaperTurnSound();
          const targetPage = spreadToPage(target);
          try {
            pageFlipRef.current.flip(targetPage, 'bottom');
          } catch (e) {
            pageFlipRef.current.turnToPage(targetPage);
          }
        }
      },
      openBook: () => {
        if (pageFlipRef.current) {
          sound.playPaperTurnSound();
          pageFlipRef.current.flip(1, 'bottom');
        }
      },
      closeBook: () => {
        if (pageFlipRef.current) {
          sound.playPaperTurnSound();
          pageFlipRef.current.flip(0, 'bottom');
        }
      },
    }),
    []
  );

  const handleNextTypewriter = () => {
    if (isTyping) return;
    setIsTyping(true);
    sound.playTypewriterKeySound();
    const nextIdx = (lineIdx + 1) % typewriterLines.length;
    setLineIdx(nextIdx);

    const full = typewriterLines[nextIdx];
    let cur = '';
    let i = 0;
    const interval = setInterval(() => {
      cur += full[i];
      setTypedText(cur);
      i++;
      if (i >= full.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 32);
  };

  const stripEmojis = (str: string) => {
    if (!str) return '';
    return str
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .replace(/[\u2600-\u27BF\uE000-\uF8FF\uFE00-\uFE0F\u200D\u20E3]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\uFFFD/g, '')
      .trim();
  };

  const buildCleanConfessionMessage = () => {
    const rName = stripEmojis(state.recipient || 'Jasmine ramadhania syarif');
    const sender = stripEmojis(state.sender || 'Aku yang Mengagumimu');
    const cleanNote = stripEmojis(replyText.trim() || 'Iya, aku mau! Mulai hari ini kita jalanin bareng yaa.');
    const cleanTitle = stripEmojis(state.bookTitle && !state.bookTitle.includes('Nuansa Pink') ? state.bookTitle : 'Tentang Kamu, Jasmine');

    const raw = `Halo ${sender}!\n\nDari: ${rName}\nAku udah baca seluruh lembaran buku "${cleanTitle}" yang kamu bikin buat aku... Sumpah aku terharu banget baca setiap kata dan draf suratnya.\n\nPesan balasan dariku:\n"${cleanNote}"`;
    return stripEmojis(raw);
  };

  const getWhatsAppUrl = () => {
    let cleanPhone = (state.whatsappNumber || '081221995470').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const waMsg = buildCleanConfessionMessage();
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
  };

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Membuka WhatsApp...');
  };

  const handleCopyMessage = () => {
    const waMsg = buildCleanConfessionMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(waMsg).then(() => {
        setCopied(true);
        sound.playWaxSealStampSound();
        showToast('Pesan balasan berhasil disalin!');
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleAcceptClick = () => {
    sound.playCelebrationChord();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#fb7185', '#fda4af', '#fef08a', '#be123c', '#ffffff'],
      });
    } catch (e) { }

    onAccept();
    showToast('Alhamdulillah! Selamat, kalian resmi berpacaran! 💖✨');
  };

  const handleShyClick = () => {
    sound.playPaperTurnSound();
    const nextIdx = (shyIdx + 1) % shyResponses.length;
    setShyIdx(nextIdx);
    setShyPrompt(shyResponses[nextIdx]);
    showToast('Snoopy: "Jangan malu-malu yaa..." 🐶💖');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isCover = state.currentSpread === 0 && !isFlipping;

  return (
    <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-1.5 sm:px-6 pt-0 pb-6 sm:py-2 flex items-center justify-center min-h-0 [perspective:2600px] -translate-y-5 sm:translate-y-0">
      {/* Soft Ambient Desk Shadow */}
      <div className="absolute -bottom-5 left-8 right-8 h-14 bg-black/75 blur-2xl rounded-full pointer-events-none" />

      {/* =========================================================================
          AUTHENTIC HARDCOVER BOOK CASING (VELVET BURGUNDY + ROSE GOLD ACCENTS)
          ========================================================================= */}
      <div
        className="relative w-full max-w-[390px] sm:max-w-none h-full max-h-[485px] sm:max-h-[615px] bg-[#3b1223] rounded-2xl shadow-2xl border border-[#f472b6]/40 flex flex-col justify-between overflow-visible mx-auto"
        style={{
          padding: '8px',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.85), inset 0 0 35px rgba(0,0,0,0.8)',
          transform: 'none',
          WebkitMaskImage: 'none',
          maskImage: 'none',
          transition: 'transform 0.65s cubic-bezier(0.34, 1.25, 0.64, 1)',
        }}
      >
        {/* Metal Corner Guards */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#f472b6] rounded-tl pointer-events-none z-30" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-[#f472b6] rounded-tr pointer-events-none z-30" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-[#f472b6] rounded-bl pointer-events-none z-30" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#f472b6] rounded-br pointer-events-none z-30" />

        {/* Stacked Paper Block Edges */}
        <div
          className="absolute -right-3 top-3.5 bottom-3.5 w-3.5 rounded-r border-r border-[#f472b6]/60 pointer-events-none z-10"
          style={{
            background: 'repeating-linear-gradient(to bottom, #fed7aa 0px, #fff1f2 1px, #fbcfe8 2px, #fffaf5 3px)',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.35), 4px 0 10px rgba(0,0,0,0.5)',
          }}
        />
        <div
          className="absolute -bottom-2.5 left-4 right-2 h-3 rounded-b border-b border-[#f472b6]/60 pointer-events-none z-10"
          style={{
            background: 'repeating-linear-gradient(to right, #fed7aa 0px, #fff1f2 1px, #fbcfe8 2px, #fffaf5 3px)',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.35), 0 5px 10px rgba(0,0,0,0.55)',
          }}
        />

        {/* Spine Headband Fabric */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#9d174d] via-[#f472b6] to-[#9d174d] rounded-full shadow pointer-events-none z-10 hidden sm:block" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#9d174d] via-[#f472b6] to-[#9d174d] rounded-full shadow pointer-events-none z-10 hidden sm:block" />

        {/* Silk Bookmark Ribbon Tab */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playPaperTurnSound();
            setIsDrawerOpen(!isDrawerOpen);
          }}
          className="absolute top-0 sm:-top-2 left-1/2 -translate-x-1/2 w-3.5 sm:w-5 h-6 sm:h-10 bg-gradient-to-r from-[#be123c] via-[#e11d48] to-[#9d174d] shadow-md z-30 rounded-t-sm hover:translate-y-1 transition-transform group cursor-pointer"
          title="Klik untuk membuka Pembatas Buku & Daftar Isi"
        >
          <div className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-0 h-0 border-l-[7px] sm:border-l-[10px] border-l-[#9d174d] border-r-[7px] sm:border-r-[10px] border-r-[#9d174d] border-b-[5px] sm:border-b-[8px] border-b-transparent" />
        </button>

        {/* Inner Pages Open Shell */}
        <div className="relative w-full h-full bg-[#3b1223] rounded-lg overflow-hidden shadow-inner block min-h-0 [transform-style:preserve-3d]">
          {/* Dog-Ear Corner Curls */}
          <button
            type="button"
            onClick={() => {
              if (pageFlipRef.current) pageFlipRef.current.flipNext('bottom');
            }}
            className={`page-corner-curl curl-right ${state.currentSpread >= 4 ? 'hidden' : ''}`}
            title="Balik ke halaman berikutnya"
          >
            <span>➔</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (pageFlipRef.current) pageFlipRef.current.flipPrev('bottom');
            }}
            className={`page-corner-curl curl-left ${state.currentSpread <= 0 ? 'hidden' : ''}`}
            title="Balik ke halaman sebelumnya"
          >
            <span>⬅</span>
          </button>

          {/* StPageFlip Native Container */}
          <div ref={containerRef} className="w-full h-full">

            {/* =========================================================================
                 PAGE 0: FRONT HARDCOVER (VINTAGE BAROQUE VECTOR FRAME & JASMINE BLOSSOM)
                 ========================================================================= */}
            <div
              className="book-page-leaf h-full flex flex-col justify-between items-center text-center relative overflow-hidden select-none cursor-pointer group"
              data-density="hard"
              id="pageHardcoverFront"
              style={{
                backgroundColor: '#3b1223',
                backgroundImage: "url('/assets/baroque_cover_frame.svg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                boxShadow: 'inset 0 0 45px rgba(0,0,0,0.9)',
              }}
            >
              <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/70 via-white/5 to-transparent pointer-events-none z-20" />

              <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-8 py-3.5 sm:py-8">
                {/* Top Archival Badge */}
                <div className="pt-0.5 sm:pt-2 flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="text-[#ffd700] text-[10px] sm:text-xs">❀</span>
                  <span className="font-cinzel text-[8.5px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.32em] text-[#edd382] uppercase font-bold drop-shadow">
                    ARCHIVAL EDITION · EDISI KHUSUS
                  </span>
                  <span className="text-[#ffd700] text-[10px] sm:text-xs">❀</span>
                </div>

                {/* Main Book Title: Tentang Kamu, Jasmine */}
                <div className="my-auto flex flex-col items-center w-full">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <div className="h-[1px] w-5 sm:w-10 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />
                    <span className="font-cinzel text-[8.5px] sm:text-[10.5px] tracking-[0.22em] sm:tracking-[0.28em] text-[#ffd700] uppercase font-semibold">
                      SEBUAH BUKU KECIL UNTUK
                    </span>
                    <div className="h-[1px] w-5 sm:w-10 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent" />
                  </div>

                  <h1 className="font-cinzel text-xl sm:text-3xl md:text-[34px] font-extrabold tracking-[0.12em] sm:tracking-[0.14em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fff3cd] to-[#edd382] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] leading-tight">
                    {state.bookTitle && !state.bookTitle.includes('Nuansa Pink') ? state.bookTitle : 'TENTANG KAMU, JASMINE'}
                  </h1>

                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                    <span className="text-[9px] sm:text-[10px] text-[#edd382]">✦</span>
                    <p className="font-serif italic text-[10px] sm:text-xs text-[#fce7f3] tracking-wide drop-shadow">
                      Keharuman Melati &amp; Kisah Hangat yang Tertulis Untukmu
                    </p>
                    <span className="text-[9px] sm:text-[10px] text-[#edd382]">✦</span>
                  </div>

                  {/* Snoopy Cameo Adorned with Jasmine Blossoms */}
                  <div className="relative mt-2.5 sm:mt-3.5 p-1.5 sm:p-2 rounded-xl bg-gradient-to-b from-[#5c1d38] to-[#1e0712] border-2 border-[#edd382] shadow-[0_12px_28px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500">
                    {/* Top-Left Jasmine Blossom */}
                    <div className="absolute -top-3 -left-3 sm:-top-3.5 sm:-left-3.5 z-20 pointer-events-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none">
                        <path d="M 25 75 C 10 65 5 45 18 35 C 30 25 45 40 38 60 Z" fill="#2d5a3f" stroke="#4ade80" strokeWidth="1.5" />
                        <path d="M 75 25 C 65 10 45 5 35 18 C 25 30 40 45 60 38 Z" fill="#204631" stroke="#4ade80" strokeWidth="1.5" />
                        <circle cx="50" cy="28" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="70" cy="44" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="62" cy="70" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="38" cy="70" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="30" cy="44" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <ellipse cx="50" cy="34" rx="8" ry="5" fill="#fffef7" />
                        <circle cx="50" cy="50" r="8" fill="#ffd700" stroke="#ca8a04" strokeWidth="1" />
                        <circle cx="50" cy="50" r="4" fill="#fef08a" />
                      </svg>
                    </div>

                    {/* Bottom-Right Jasmine Blossom */}
                    <div className="absolute -bottom-2.5 -right-2.5 sm:-bottom-3 sm:-right-3 z-20 pointer-events-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 100 100" fill="none">
                        <path d="M 75 75 C 85 60 85 40 70 30 C 55 20 40 35 48 55 Z" fill="#2d5a3f" stroke="#4ade80" strokeWidth="1.5" />
                        <circle cx="50" cy="28" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="70" cy="44" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="62" cy="70" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="38" cy="70" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="30" cy="44" r="14" fill="#ffffff" stroke="#fef08a" strokeWidth="1" />
                        <circle cx="50" cy="50" r="8" fill="#ffd700" stroke="#ca8a04" strokeWidth="1" />
                        <circle cx="50" cy="50" r="4" fill="#fef08a" />
                      </svg>
                    </div>

                    <div className="relative w-36 sm:w-48 h-24 sm:h-32 rounded-lg overflow-hidden border border-[#edd382]/70 shadow-inner">
                      <Image
                        src="/assets/snoopy_starry_night.jpg"
                        alt="Snoopy di bawah langit malam bertabur bintang untuk Jasmine"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7a1] to-[#aa8022] text-[#240a17] font-cinzel text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase shadow-md border border-[#fff8d6] whitespace-nowrap">
                      ❀ SNOOPY &amp; BUNGA MELATI ❀
                    </div>
                  </div>

                  {/* Dedication Plaque for Jasmine */}
                  <div className="mt-2.5 sm:mt-3.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-[#180812]/95 via-[#2b0c1e]/95 to-[#180812]/95 border border-[#edd382]/70 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-xs flex flex-col items-center">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[7.5px] sm:text-[8.5px] font-cinzel tracking-[0.2em] sm:tracking-[0.25em] text-[#edd382] uppercase font-bold">
                      <span>✦</span>
                      <span>DIPERSEMBAHKAN KHUSUS UNTUK</span>
                      <span>✦</span>
                    </div>
                    <span className="font-serif text-xs sm:text-sm text-white font-bold tracking-wider mt-0.5 drop-shadow">
                      {state.recipient || 'Jasmine ramadhania syarif'}
                    </span>
                    <span className="text-[8px] sm:text-[8.5px] font-typewriter text-[#fce7f3] mt-0.5">
                      Dari: <strong className="text-white font-serif">{state.sender}</strong>
                    </span>
                  </div>
                </div>

                {/* Open Book Button */}
                <div className="pb-0.5 sm:pb-1">
                  <div className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#f7e7a1] to-[#aa8022] hover:from-[#f7e7a1] hover:to-[#d4af37] text-[#240a17] text-[11px] sm:text-[13px] font-cinzel tracking-[0.14em] sm:tracking-[0.16em] font-extrabold shadow-[0_8px_24px_rgba(212,175,55,0.45)] flex items-center gap-1.5 sm:gap-2 group-hover:scale-105 transition-all duration-300 border border-[#fff8d6] cursor-pointer">
                    <span>❀ BUKA BUKU KECIL JASMINE ➔ ❀</span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 1: SPREAD 1 LEFT (DEDIKASI - HAL. 00)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-left h-full p-2.5 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-1 sm:pb-2 mb-1.5 sm:mb-3">
                  <span className="font-typewriter text-[9px] sm:text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    SEBUAH CATATAN HANGAT · UNTUKMU
                  </span>
                  <span className="font-typewriter text-[9px] sm:text-[11px] text-[#9d174d]">
                    {state.dateBadge}
                  </span>
                </div>

                <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-2 sm:p-3.5 shadow-sm relative">
                  <div className="washi-tape w-16 sm:w-24 h-3.5 sm:h-5 -top-2 left-6 absolute rotate-[-2deg]" />
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="font-serif italic text-[11px] sm:text-xs text-[#be123c] font-bold">Lembar Persembahan</span>
                    <span className="text-[8.5px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c] font-medium">Khusus Untukmu 💖</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-serif border-t border-dashed border-[#fbcfe8] pt-1 sm:pt-2">
                    <div>
                      <span className="text-[8.5px] sm:text-[10px] font-typewriter text-[#9d174d] block font-bold">UNTUK:</span>
                      <strong className="text-[#3b1223] text-[11px] sm:text-sm leading-tight block">{state.recipient || 'Jasmine ramadhania syarif'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] sm:text-[10px] font-typewriter text-[#9d174d] block font-bold">DARI:</span>
                      <strong className="text-[#3b1223] text-[11px] sm:text-sm leading-tight block">{state.sender}</strong>
                    </div>
                  </div>

                  <div className="mt-1.5 pt-1 sm:pt-2 border-t border-dashed border-[#fbcfe8] text-[10px] sm:text-xs text-[#4c0519] leading-relaxed font-serif italic">
                    &quot;Buku kecil ini kubuat pelan-pelan khusus untukmu. Di dalamnya ada beberapa lembar cerita jujur, alunan lagu kesukaan, dan perasaan yang akhirnya berani kutitipkan lewat kata-kata.&quot;
                  </div>
                </div>

                <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
                  <p className="font-handwriting text-base sm:text-2xl text-[#be123c] leading-tight">
                    &quot;Ada beberapa hal yang terlalu berharga kalau cuma diucapkan lewat chat singkat...&quot;
                  </p>
                  <p className="text-[10px] sm:text-[13px] text-[#4c0519] leading-relaxed">
                    Jadi kubuatkan buku kecil bernuansa merah jambu ini—ditemani Snoopy yang setia, secangkir kehangatan, dan lembaran sederhana tentang kita.
                  </p>
                </div>

                <div className="mt-1.5 sm:mt-3 p-1.5 sm:p-2.5 bg-[#fef9c3]/70 border border-[#fde047] rounded-lg shadow-2xs relative">
                  <div className="washi-tape w-10 sm:w-12 h-3 sm:h-3.5 -top-1.5 left-4 absolute" />
                  <p className="font-handwriting text-[10px] sm:text-sm text-[#854d0e] leading-snug">
                    &quot;Buka setiap lembarnya dengan santai ya... semoga senyummu selalu merekah di setiap halamannya.&quot;
                  </p>
                </div>
              </div>

              <div className="mt-1 sm:mt-3 pt-1 sm:pt-3 border-t border-[#fbcfe8] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[11px] text-[#9d174d]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#be123c] animate-pulse" />
                  <span>Tarik ujung kertas untuk membalik!</span>
                </div>
                <span className="font-typewriter text-[9px] sm:text-[10px] text-[#9d174d]">HAL. 00</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 2: SPREAD 1 RIGHT (TURNTABLE ADU RAYU - HAL. 01)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-right h-full p-3.5 sm:p-6 flex flex-col justify-between items-center text-center relative page-scroll overflow-y-auto" data-density="soft">
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-[#fbcfe8] pb-1.5 sm:pb-2 mb-2 sm:mb-3">
                  <span className="font-typewriter text-[10px] sm:text-[10.5px] uppercase tracking-widest text-[#be123c] font-bold">
                    PEANUTS ARCHIVAL · VINYL EDITION
                  </span>
                  <span className="font-typewriter text-[10px] sm:text-[11px] text-[#9d174d]">ADU RAYU 🎵</span>
                </div>

                <div className="relative w-full max-w-[270px] sm:max-w-[310px] bg-gradient-to-b from-[#2a0c18] to-[#19050d] rounded-2xl p-3 sm:p-5 border-2 border-[#f472b6] shadow-xl flex flex-col items-center">
                  <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[8.5px] sm:text-[9px] font-typewriter text-[#fbcfe8]">
                    <span className={`w-2 h-2 rounded-full ${isAudioPlaying ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                    <span>{isAudioPlaying ? 'PLAYING VINYL' : 'TURNTABLE STANDBY'}</span>
                  </div>

                  <div className="relative w-30 h-30 sm:w-40 sm:h-40 mt-1 sm:mt-2 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 rounded-full bg-[#120409] border-4 border-[#4a1428] shadow-inner" />

                    <div
                      className={`relative w-26 h-26 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border border-[#33111f] ${isAudioPlaying ? 'animate-spin-slow' : ''
                        }`}
                      style={{
                        background:
                          'repeating-radial-gradient(circle, #1a060f 0px, #1a060f 2px, #2d0d1b 3px, #14040b 4px)',
                        boxShadow: '0 0 20px rgba(0,0,0,0.85), inset 0 0 10px rgba(244,114,182,0.15)',
                      }}
                    >
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#be123c] to-[#881337] border-2 border-[#ffd700] flex flex-col items-center justify-center p-0.5 sm:p-1 text-center shadow">
                        <span className="text-[6.5px] sm:text-[7px] font-cinzel text-[#ffd700] font-bold tracking-wider leading-none">PEANUTS</span>
                        <span className="text-[7px] sm:text-[8px] my-0.5">🐶🐾</span>
                        <span className="text-[5.5px] sm:text-[6px] font-typewriter text-white/90 leading-tight">ADU RAYU</span>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#14040b] border border-[#ffd700] mt-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3 text-center">
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-white tracking-wide">Adu Rayu</h4>
                    <p className="font-typewriter text-[9px] sm:text-[10px] text-[#fbcfe8] mt-0.5">Yovie Widianto · Tulus · Glenn Fredly</p>
                  </div>

                  <div className="w-full mt-2 sm:mt-2.5 flex items-center gap-2">
                    <span className="text-[8.5px] sm:text-[9px] font-typewriter text-[#fbcfe8]">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 208}
                      step="0.5"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-[#4c0519] rounded-lg appearance-none cursor-pointer accent-[#f472b6]"
                    />
                    <span className="text-[8.5px] sm:text-[9px] font-typewriter text-[#fbcfe8]">{formatTime(duration || 208)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleVinylAudio}
                    className="mt-2.5 sm:mt-3 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#be123c] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] text-white text-[11px] sm:text-xs font-serif font-bold tracking-wide shadow-md flex items-center gap-1.5 sm:gap-2 transition cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <>
                        <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        <span>Jeda Lagu ⏸️</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        <span>Putar Lagu Adu Rayu 🎵</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="font-handwriting text-xs sm:text-sm text-[#be123c] mt-2 sm:mt-2.5">
                  &quot;Lagu yang paling pas buat nemenin kamu membaca buku kecil ini...&quot;
                </p>
              </div>

              <div className="w-full pt-1.5 sm:pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[9.5px] sm:text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">TARIK HALAMAN KE KIRI ➔</span>
                <span>HAL. 01</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 3: SPREAD 2 LEFT (BAB I: FOTO SPESIAL CRUSH - HAL. 02)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-left h-full p-3.5 sm:p-5 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-1 sm:pb-1.5 mb-1.5 sm:mb-2">
                  <span className="font-typewriter text-[10px] sm:text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB I: TENTANG SENYUMMU
                  </span>
                  <span className="font-typewriter text-[10px] sm:text-[11px] text-[#9d174d]">SCRAPBOOK</span>
                </div>

                <p className="text-[10.5px] sm:text-xs font-serif italic text-[#4c0519] leading-snug mb-1.5 sm:mb-2">
                  Wajah yang selalu berhasil bikin hariku mendadak jauh lebih cerah 🌸
                </p>

                {/* Polaroid Frame of Crush's Photo */}
                <div
                  onClick={() =>
                    setSelectedPolaroid({
                      src: '/assets/special_memory.jpg',
                      caption: 'Senyuman Jasmine yang selalu berhasil bikin hariku mendadak jauh lebih cerah 🌸',
                      chapter: 'Bab I: Tentang Senyummu',
                    })
                  }
                  className="relative bg-white p-2 sm:p-2.5 rounded-lg shadow-md border border-[#fbcfe8] max-w-[210px] sm:max-w-[260px] mx-auto cursor-pointer group hover:rotate-1 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="washi-tape w-12 sm:w-16 h-3 sm:h-3.5 -top-1.5 left-4 sm:left-5 absolute -rotate-3" />
                  <div className="washi-tape w-12 sm:w-16 h-3 sm:h-3.5 -top-1.5 right-4 sm:right-5 absolute rotate-3" />

                  <div className="relative w-full h-36 sm:h-48 rounded-lg overflow-hidden bg-[#fff0f3] border border-[#fce7f3] flex items-center justify-center p-1">
                    <img
                      src="/assets/special_memory.jpg"
                      alt="Foto Spesial Jasmine ramadhania syarif"
                      className="max-h-full max-w-full object-contain mx-auto rounded shadow-2xs group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 text-[8px] sm:text-[8.5px] font-typewriter text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-2.5 h-2.5 text-pink-300" />
                      <span>Perbesar</span>
                    </div>
                  </div>

                  <p className="mt-1 font-handwriting text-xs sm:text-sm text-[#be123c] text-center leading-snug">
                    Senyuman yang selalu bikin tenang 🌸
                  </p>
                </div>

                <div className="mt-1.5 sm:mt-2 p-2 sm:p-2.5 bg-[#fff1f2] border border-[#fbcfe8] rounded-lg text-[10px] sm:text-xs font-serif leading-relaxed text-[#4c0519]">
                  <p className="italic">
                    &quot;Di antara jutaan hal yang ada di dunia maya, foto dan senyum manismu ini yang selalu paling aku tunggu, Jasmine. Sederhana, tapi magisnya nyata banget bikin hati adem.&quot;
                  </p>
                </div>
              </div>

              <div className="pt-1 sm:pt-1.5 border-t border-[#fbcfe8] flex items-center justify-between text-[9.5px] sm:text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">KLIK FOTO UNTUK MEMPERBESAR</span>
                <span>HAL. 02</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 4: SPREAD 2 RIGHT (BAB I: PUISI SASTRA & MESIN TIK - HAL. 03)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-right h-full p-3.5 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-1.5 sm:pb-2 mb-2 sm:mb-3">
                  <span className="font-typewriter text-[10px] sm:text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB I: SASTRA & DRAF PERASAAN
                  </span>
                  <span className="font-typewriter text-[10px] sm:text-[11px] text-[#9d174d]">DRAF TULUS</span>
                </div>

                {/* Sastra Puisi Card from User */}
                <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-3 sm:p-3.5 shadow-sm relative">
                  <div className="washi-tape w-20 sm:w-24 h-3.5 sm:h-4 -top-2 left-6 absolute" />
                  <p className="font-serif italic text-[11px] sm:text-[12.5px] text-[#4c0519] leading-relaxed whitespace-pre-line">
                    &quot;kalau pada akhir aku hanya bisa mengagumimu dari jauh setidaknya terimakasih kepada semesta karena pernah mengizinkanku mengenal seseorang sejosjis kamu.
                    {'\n\n'}
                    jangan jadi orang bingung, ya?
                    aku tidak tahu harus membaca sikapmu sebagai apa
                    kadang kamu terasa begitu dekat
                    lalu esoknya seperti tidak pernah mengenalku
                    sedangkan aku,
                    sudah terlanjur mengagumi lebih dari yang seharusnya.&quot;
                  </p>
                </div>

                {/* Interactive Typewriter Machine Box */}
                <div className="mt-3 sm:mt-4 bg-[#fdf2f8] border border-[#fbcfe8] rounded-xl p-3 sm:p-3.5 shadow-sm relative">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="font-typewriter text-[9.5px] sm:text-[10px] text-[#9d174d] font-bold uppercase tracking-wider">
                      KERTAS ARSIP NO. 14 · MESIN TIK
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] font-typewriter text-[#be123c]">CATATAN PINK</span>
                  </div>

                  <div className="bg-white border border-[#fbcfe8] rounded-lg p-2.5 sm:p-3 min-h-[75px] sm:min-h-[90px] flex items-center shadow-inner">
                    <p className="font-typewriter text-[11px] sm:text-xs text-[#3b1223] leading-relaxed">
                      {typedText}
                      <span className="inline-block w-1.5 h-3.5 bg-[#be123c] ml-1 animate-pulse" />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextTypewriter}
                    className="mt-2 sm:mt-2.5 w-full py-1.5 px-3 rounded-lg bg-[#be123c] hover:bg-[#9d174d] text-white text-[10.5px] sm:text-[11px] font-typewriter font-semibold flex items-center justify-center gap-1.5 transition shadow cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ketik Draf Surat Berikutnya ⌨️</span>
                  </button>
                </div>
              </div>

              <div className="pt-1.5 sm:pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[9.5px] sm:text-[10px] font-typewriter text-[#9d174d]">
                <span>KETUK UNTUK DRAF BERIKUTNYA</span>
                <span>HAL. 03</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 5: SPREAD 3 LEFT (BAB II: DRAF SEBELUM CONFESS - HAL. 04)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet paper-ruled page-arch-left h-full p-3.5 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-1.5 sm:pb-2 mb-2 sm:mb-3">
                  <span className="font-typewriter text-[10px] sm:text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB II: DRAF SEBELUM CONFESS
                  </span>
                  <span className="font-typewriter text-[10px] sm:text-[11px] text-[#9d174d]">SURAT JUJUR</span>
                </div>

                <h3 className="font-serif text-sm sm:text-lg font-bold text-[#3b1223] mb-1.5 sm:mb-2">
                  Satu Pengakuan Tulus Dari Lubuk Hati
                </h3>

                <div className="bg-[#fff1f2]/80 border border-[#fbcfe8] rounded-xl p-2.5 sm:p-3.5 shadow-sm text-[11px] sm:text-[13px] text-[#3b1223] font-serif leading-relaxed space-y-1.5 sm:space-y-2.5">
                  <p>
                    hai, maaf kalo ini kedengeran random dan konyol, tapi to be honest aku suka banget sama kamu. sebenernya aku udah merhatiin kamu dari lama, jauh sebelum kita kenal, cuma waktu itu belum berani make a move atau sekadar follow duluan hehe.
                  </p>
                  <p>
                    I genuinely admire kepinteran dan vibe kamu, you&apos;re literally my dream girl. aku deketin kamu bukan buat main-main atau sekadar penasaran, I&apos;m being completely sincere here.
                  </p>
                  <p>
                    Aku sadar chances-nya kecil karena kita baru banget deket, jadi aku ngga naruh ekspektasi apa-apa. aku cuma pengen ngungkapin aja biar perasaan aku lebih lega aja. my bad kalau selama ini aku kesannya ngechatin kamu terus atau mungkin bikin kamu uncomfortable.
                  </p>
                  <p>
                    kalau setelah chat ini kamu milih buat keep distance atau bersikap asing, its okay kok... yang penting aku udah gentleman buat jujur soal perasaan aku ke kamu.
                  </p>
                </div>

                <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#be123c]">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="font-serif italic text-[10.5px] sm:text-[11px]">Sincere Gentleman</span>
                  </div>
                  <span className="font-handwriting text-sm sm:text-base text-[#be123c]">
                    — Dengan tulus, {state.sender}
                  </span>
                </div>
              </div>

              <div className="pt-1.5 sm:pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[9.5px] sm:text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">DRAF TERAKHIR SEBELUM CONFESS</span>
                <span>HAL. 04</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 6: SPREAD 3 RIGHT (BAB III: KEPUTUSAN HATI & BALASAN - HAL. 05)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-right h-full p-3 sm:p-5 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-[#fbcfe8] pb-1 sm:pb-1.5 mb-1 sm:mb-2">
                  <span className="font-typewriter text-[10px] sm:text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB III: KEPUTUSAN HATI & BALASAN
                  </span>
                  <span className="font-typewriter text-[10px] sm:text-[11px] text-[#9d174d]">CONFESSION 💖</span>
                </div>

                <div className="relative my-0.5 sm:my-1 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#f472b6] shadow-sm bg-white shrink-0">
                  <Image
                    src="/assets/snoopy_flower_bouquet.jpg"
                    alt="Snoopy membawa bunga mawar pink"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Template Pilihan Balasan Cepat */}
                <div
                  data-no-flip="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full max-w-xs my-0.5 sm:my-1 space-y-1"
                >
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playCelebrationChord();
                        try {
                          confetti({
                            particleCount: 90,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#f472b6', '#fb7185', '#fda4af', '#fef08a', '#be123c', '#ffffff'],
                          });
                        } catch (e) { }
                        setReplyText('Iya, aku mau! Mulai hari ini kita jalanin bareng yaa. Makasih udah se-sincere dan se-gentleman ini ngungkapin perasaanmu.');
                        showToast('Pesan balasan: "Iya, aku mau!" 💖');
                      }}
                      className="flex-1 py-1 sm:py-1.5 px-2 rounded-full bg-gradient-to-r from-[#be123c] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] text-white text-[10px] sm:text-[11px] font-serif font-bold tracking-wide shadow-sm hover:scale-102 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current animate-pulse text-pink-200" />
                      <span>Iya, Aku Mau! 💖</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playPaperTurnSound();
                        setReplyText('Makasih banyak yaa draf bukunya manis dan tulus banget... Kita kenalan dan ngobrol lebih dekat dulu yuk! 🌸');
                        showToast('Pesan balasan: "Kenalan lebih dekat dulu" 🌸');
                      }}
                      className="flex-1 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-full bg-white hover:bg-[#fff1f2] border border-[#fbcfe8] text-[#be123c] text-[9.5px] sm:text-[10.5px] font-typewriter transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>Kenalan Dulu 🌸</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPaperTurnSound();
                      const shyOptions = [
                        'Hehe makasih banyak yaa draf bukunya manis banget, aku seneng bacanya tapi masih agak malu-malu...',
                        'Aaa lucu banget bukunya, jujur aku kaget sekaligus terharu bacanya...',
                        'Makasih yaa udah seberani ini bikin buku buat aku, aku hargai banget ketulusanmu...',
                      ];
                      const next = shyOptions[(shyIdx + 1) % shyOptions.length];
                      setShyIdx(shyIdx + 1);
                      setReplyText(next);
                      showToast('Pesan balasan diubah 🙈');
                    }}
                    className="w-full py-0.5 sm:py-1 px-2 rounded-full bg-white/80 hover:bg-[#fff1f2] border border-dashed border-[#fbcfe8] text-[#9d174d] text-[9px] sm:text-[10px] font-typewriter transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>Masih Malu-malu 🙈 (Klik ganti draf santai)</span>
                  </button>
                </div>

                {/* Tiket Balasan Resmi & WhatsApp */}
                <div
                  data-no-flip="true"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full mt-1 bg-[#fff1f2] border-2 border-[#f472b6] rounded-xl p-2 sm:p-2.5 shadow-sm text-left relative"
                >
                  <div className="washi-tape w-14 sm:w-16 h-2.5 sm:h-3 -top-1.5 left-4 absolute" />
                  <div className="flex items-center justify-between border-b border-dashed border-[#fbcfe8] pb-0.5 sm:pb-1 mb-1 sm:mb-1.5">
                    <div>
                      <span className="text-[8px] sm:text-[8.5px] font-typewriter text-[#9d174d] uppercase block font-bold">
                        KARTU BALASAN UNTUKMU
                      </span>
                      <strong className="text-[10.5px] sm:text-[11px] font-serif text-[#3b1223]">
                        PESAN DARI JASMINE
                      </strong>
                    </div>
                    <span className="text-[9px] sm:text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c] font-bold">
                      PESAN BALASAN 💌
                    </span>
                  </div>

                  <div className="mb-1 sm:mb-1.5">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] sm:text-[9.5px] font-typewriter text-[#9d174d] font-bold">
                        PESAN BALASAN DARI KAMU:
                      </span>
                      <span className="text-[8px] sm:text-[8.5px] text-[#be123c] italic font-typewriter">
                        (Bisa kamu edit/ketik sendiri)
                      </span>
                    </div>
                    <textarea
                      ref={replyTextareaRef}
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      className="w-full text-[11px] sm:text-xs font-serif bg-white border border-[#fbcfe8] rounded-lg p-1 sm:p-1.5 text-[#3b1223] focus:outline-none focus:border-[#be123c]"
                      placeholder="Tulis pesan balasanmu di sini..."
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-1.5">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="w-full py-1.5 sm:py-2 px-3 rounded-lg bg-gradient-to-r from-[#25d366] to-[#128c7e] hover:from-[#128c7e] hover:to-[#25d366] text-white text-[11px] sm:text-xs font-serif font-bold shadow-sm hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Kirim Jawaban Manis ke WhatsApp 💌</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="w-full py-1 px-2.5 rounded-lg bg-white hover:bg-[#fff1f2] border border-[#fbcfe8] text-[#be123c] text-[10px] sm:text-[10.5px] font-typewriter transition flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Tersalin ke Clipboard! ✨' : 'Salin Pesan Balasan 📋'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1 sm:pt-1.5 border-t border-[#fbcfe8] flex items-center justify-between text-[9.5px] sm:text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">AKHIR BUKU KECIL · AWAL KITA BERDUA 🌸</span>
                <span>HAL. 05</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 7: BACK HARDCOVER (VINTAGE BAROQUE VECTOR FRAME)
                 ========================================================================= */}
            <div
              className="book-page-leaf h-full flex flex-col justify-between items-center text-center relative overflow-hidden select-none cursor-pointer"
              data-density="hard"
              id="pageHardcoverBack"
              style={{
                backgroundColor: '#3b1223',
                backgroundImage: "url('/assets/baroque_cover_frame.svg')",
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                boxShadow: 'inset 0 0 45px rgba(0,0,0,0.9)',
              }}
            >
              <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-black/70 via-white/5 to-transparent pointer-events-none z-20" />

              <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 sm:px-8 py-4 sm:py-9">
                <div className="pt-1 sm:pt-3">
                  <span className="font-cinzel text-[8.5px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] text-[#fbcfe8] uppercase font-bold drop-shadow">
                    ★ AKHIR CATATAN PINK ★
                  </span>
                </div>

                <div className="my-auto flex flex-col items-center w-full max-w-xs">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#5c1d38] border-2 border-[#f472b6] flex items-center justify-center text-xl sm:text-2xl my-1 sm:my-2 shadow-inner">
                    🌸
                  </div>
                  <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#ffd700] tracking-widest uppercase mt-1 sm:mt-2">
                    PEANUTS ARCHIVE
                  </h3>
                  <div className="w-28 sm:w-36 h-0.5 bg-gradient-to-r from-transparent via-[#f472b6] to-transparent my-1.5 sm:my-2" />
                  <p className="font-handwriting text-base sm:text-lg text-[#fce7f3] leading-snug">
                    &quot;Terima kasih sudah membaca sampai lembar terakhir. Semoga buku kecil ini berhasil bikin senyummu merekah hari ini. 🌸&quot;
                  </p>
                  <div className="mt-3 sm:mt-4 pt-1.5 sm:pt-2 border-t border-dashed border-[#f472b6]/40 w-full text-[9px] sm:text-[10px] font-typewriter text-[#fce7f3]">
                    TANDA TANGAN: <span className="text-white font-bold">{state.sender}</span>
                  </div>
                </div>

                <div className="pb-0.5 sm:pb-2">
                  <div className="px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#240a17]/90 border border-[#f472b6]/60 text-[#fce7f3] text-[9.5px] sm:text-[10px] font-cinzel tracking-wider">
                    ✦ TERIMA KASIH TELAH MEMBACA ✦
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bookmark Drawer Popover */}
      <BookmarkDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onJumpTo={(idx) => {
          if (pageFlipRef.current) {
            pageFlipRef.current.flip(spreadToPage(idx), 'bottom');
          }
          setIsDrawerOpen(false);
        }}
        currentSpread={state.currentSpread}
      />

      {/* Polaroid Image Lightbox Modal */}
      {selectedPolaroid && (
        <div
          onClick={() => {
            sound.playPaperTurnSound();
            setSelectedPolaroid(null);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white p-4 sm:p-5 rounded-2xl max-w-sm sm:max-w-md w-full shadow-2xl border-4 border-[#fbcfe8] cursor-default animate-scale-up"
          >
            <button
              onClick={() => {
                sound.playPaperTurnSound();
                setSelectedPolaroid(null);
              }}
              type="button"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 text-[#be123c] font-bold flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative w-full h-[65vh] max-h-[520px] rounded-xl overflow-hidden bg-black/95 border border-rose-300 flex items-center justify-center p-2">
              <img
                src={selectedPolaroid.src}
                alt={selectedPolaroid.caption}
                className="max-h-full max-w-full object-contain mx-auto rounded shadow-lg"
              />
            </div>

            <div className="mt-3 text-center">
              <span className="text-[10px] font-typewriter text-[#9d174d] uppercase font-bold tracking-wider">
                {selectedPolaroid.chapter}
              </span>
              <p className="font-handwriting text-lg text-[#be123c] mt-1 leading-snug">
                {selectedPolaroid.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
});
