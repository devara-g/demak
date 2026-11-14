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
  if (spreadIndex >= 5) return 9;
  return (spreadIndex - 1) * 2 + 1;
};

const pageToSpread = (pageIndex: number): number => {
  if (pageIndex <= 0) return 0;
  if (pageIndex >= 9) return 5;
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
        } catch (e) {}
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
    const cleanNote = stripEmojis(replyText.trim() || 'Iya, aku mau jadi pacarmu!');
    const cleanMood = stripEmojis(selectedMood || 'Senyum-senyum sendiri');
    const cleanGoal = stripEmojis(coupleGoal || 'Makan di warung langganan hangat kuah dan sambal');
    const cleanTitle = stripEmojis(state.bookTitle || 'Tentang Kamu & Nuansa Pink');

    const raw = `Halo ${sender}!\n\nDari: ${rName}\nIya, aku mau jadi pacarmu!\nAku udah baca seluruh lembaran buku "${cleanTitle}" yang kamu bikin buat aku... Sumpah aku terharu banget baca setiap kata dan draf suratnya.\n\nPerasaanku pas baca: "${cleanMood}"\nHal pertama yang paling aku tunggu bareng kamu kalau nanti ketemu:\n"${cleanGoal}"\n\nPesan manis dariku:\n"${cleanNote}"\n\nMulai hari ini kita resmi berpacaran ya! Semoga hari-hari kita selalu hangat, penuh tawa, dan bahagia berdua.`;
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
    } catch (e) {}

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
  const shouldCenterCover = isCover && isWideScreen;

  return (
    <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-center min-h-0 [perspective:2600px]">
      {/* Soft Ambient Desk Shadow */}
      <div className="absolute -bottom-5 left-8 right-8 h-14 bg-black/75 blur-2xl rounded-full pointer-events-none" />

      {/* =========================================================================
          AUTHENTIC HARDCOVER BOOK CASING (VELVET BURGUNDY + ROSE GOLD ACCENTS)
          ========================================================================= */}
      <div
        className="relative w-full h-full max-h-[580px] sm:max-h-[615px] bg-[#3b1223] rounded-2xl shadow-2xl border border-[#f472b6]/40 flex flex-col justify-between overflow-visible"
        style={{
          padding: '8px',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.85), inset 0 0 35px rgba(0,0,0,0.8)',
          transform: shouldCenterCover ? 'translateX(-25%)' : 'translateX(0)',
          WebkitMaskImage: shouldCenterCover ? 'linear-gradient(to right, transparent 50%, black 50%)' : 'none',
          maskImage: shouldCenterCover ? 'linear-gradient(to right, transparent 50%, black 50%)' : 'none',
          transition: 'transform 0.65s cubic-bezier(0.34, 1.25, 0.64, 1), -webkit-mask-image 0.25s ease, mask-image 0.25s ease',
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
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#9d174d] via-[#f472b6] to-[#9d174d] rounded-full shadow pointer-events-none z-10" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#9d174d] via-[#f472b6] to-[#9d174d] rounded-full shadow pointer-events-none z-10" />

        {/* Silk Bookmark Ribbon Tab */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playPaperTurnSound();
            setIsDrawerOpen(!isDrawerOpen);
          }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-10 bg-gradient-to-r from-[#be123c] via-[#e11d48] to-[#9d174d] shadow-md z-30 rounded-t-sm hover:translate-y-1 transition-transform group cursor-pointer"
          title="Klik untuk membuka Pembatas Buku & Daftar Isi"
        >
          <div className="absolute -bottom-2 left-0 w-0 h-0 border-l-[10px] border-l-[#9d174d] border-r-[10px] border-r-[#9d174d] border-b-[8px] border-b-transparent" />
        </button>

        {/* Inner Pages Open Shell */}
        <div className="relative w-full h-full bg-[#3b1223] rounded-lg overflow-hidden shadow-inner flex min-h-0 [transform-style:preserve-3d]">
          {/* Central Book Binding Valley Shadow */}
          <div className="book-gutter-valley" />

          {/* Dog-Ear Corner Curls */}
          <button
            type="button"
            onClick={() => {
              if (pageFlipRef.current) pageFlipRef.current.flipNext('bottom');
            }}
            className={`page-corner-curl curl-right ${state.currentSpread >= 5 ? 'hidden' : ''}`}
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
                 PAGE 0: FRONT HARDCOVER (VINTAGE BAROQUE VECTOR FRAME)
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

              <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-6 sm:px-8 py-7 sm:py-9">
                <div className="pt-2 sm:pt-3">
                  <span className="font-cinzel text-[9.5px] sm:text-[10px] tracking-[0.35em] text-[#fbcfe8] uppercase font-bold drop-shadow">
                    PEANUTS ARCHIVAL · EDISI PINK
                  </span>
                </div>

                <div className="my-auto flex flex-col items-center w-full">
                  <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.16em] uppercase text-[#ffd700] drop-shadow-md leading-tight">
                    {state.bookTitle || 'TENTANG KAMU & NUANSA PINK'}
                  </h1>

                  <p className="font-cinzel text-[10px] sm:text-[11px] tracking-[0.22em] text-[#fbcfe8] font-semibold mt-1">
                    ✦ SEBUAH BUKU KECIL UNTUKMU ✦
                  </p>

                  <div className="relative mt-4 p-1.5 sm:p-2 rounded-xl bg-gradient-to-b from-[#5c1d38] to-[#2a0c18] border-2 border-[#f472b6] shadow-[0_12px_28px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500">
                    <div className="relative w-40 sm:w-48 h-28 sm:h-32 rounded-lg overflow-hidden border border-[#fbcfe8]/60">
                      <Image
                        src="/assets/snoopy_starry_night.jpg"
                        alt="Snoopy di atas rumah anjing menatap bintang malam"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#be123c] text-white font-cinzel text-[8.5px] sm:text-[9px] font-bold tracking-wider uppercase shadow">
                      SNOOPY & WOODSTOCK
                    </div>
                  </div>

                  <div className="mt-4 px-3 sm:px-4 py-1 rounded bg-[#240a17]/90 border border-[#f472b6]/70 shadow-md">
                    <p className="font-cinzel text-[9.5px] sm:text-[10px] text-[#fce7f3] tracking-wider font-semibold">
                      UNTUK: <span className="text-white font-bold">{state.recipient || 'Jasmine ramadhania syarif'}</span> · DARI: <span className="text-white font-bold">{state.sender}</span>
                    </p>
                  </div>
                </div>

                <div className="pb-1 sm:pb-2">
                  <div className="px-5 py-2 rounded-full bg-gradient-to-r from-[#9d174d] via-[#be123c] to-[#9d174d] border border-[#fbcfe8]/80 text-white text-xs font-cinzel tracking-widest font-bold shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
                    <span>❖ BUKA SAMPUL BUKU ➔ ❖</span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 1: SPREAD 1 LEFT (DEDIKASI - HAL. 00)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    SEBUAH CATATAN HANGAT · UNTUKMU
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">
                    {state.dateBadge}
                  </span>
                </div>

                <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-3.5 shadow-sm relative">
                  <div className="washi-tape w-24 h-5 -top-2.5 left-8 absolute rotate-[-2deg]" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif italic text-xs text-[#be123c] font-bold">Lembar Persembahan</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c] font-medium">Khusus Untukmu 💖</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-serif border-t border-dashed border-[#fbcfe8] pt-2">
                    <div>
                      <span className="text-[10px] font-typewriter text-[#9d174d] block font-bold">UNTUK:</span>
                      <strong className="text-[#3b1223] text-sm">{state.recipient || 'Jasmine ramadhania syarif'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-typewriter text-[#9d174d] block font-bold">DARI:</span>
                      <strong className="text-[#3b1223] text-sm">{state.sender}</strong>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-dashed border-[#fbcfe8] text-xs text-[#4c0519] leading-relaxed font-serif italic">
                    &quot;Buku kecil ini kubuat pelan-pelan khusus untukmu. Di dalamnya ada beberapa lembar cerita jujur, alunan lagu kesukaan, dan perasaan yang akhirnya berani kutitipkan lewat kata-kata.&quot;
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="font-handwriting text-2xl text-[#be123c] leading-tight">
                    &quot;Ada beberapa hal yang terlalu berharga kalau cuma diucapkan lewat chat singkat...&quot;
                  </p>
                  <p className="text-xs sm:text-[13px] text-[#4c0519] leading-relaxed">
                    Jadi kubuatkan buku kecil bernuansa merah jambu ini—ditemani Snoopy yang setia, secangkir kehangatan, dan lembaran sederhana tentang kita.
                  </p>
                </div>

                <div className="mt-3 p-2.5 bg-[#fef9c3]/70 border border-[#fde047] rounded-lg shadow-2xs relative">
                  <div className="washi-tape w-12 h-3.5 -top-1.5 left-4 absolute" />
                  <p className="font-handwriting text-xs sm:text-sm text-[#854d0e] leading-snug">
                    &quot;Buka setiap lembarnya dengan santai ya... semoga senyummu selalu merekah di setiap halamannya.&quot;
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#fbcfe8] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] text-[#9d174d]">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#be123c] animate-pulse" />
                  <span>Tarik ujung sudut kertas untuk membalik halaman!</span>
                </div>
                <span className="font-typewriter text-[10px] text-[#9d174d]">HAL. 00</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 2: SPREAD 1 RIGHT (TURNTABLE ADU RAYU - HAL. 01)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between items-center text-center relative page-scroll overflow-y-auto" data-density="soft">
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[10.5px] uppercase tracking-widest text-[#be123c] font-bold">
                    PEANUTS ARCHIVAL · VINYL EDITION
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">ADU RAYU 🎵</span>
                </div>

                <div className="relative w-full max-w-[285px] sm:max-w-[310px] bg-gradient-to-b from-[#2a0c18] to-[#19050d] rounded-2xl p-4 sm:p-5 border-2 border-[#f472b6] shadow-xl flex flex-col items-center">
                  <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] font-typewriter text-[#fbcfe8]">
                    <span className={`w-2 h-2 rounded-full ${isAudioPlaying ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                    <span>{isAudioPlaying ? 'PLAYING VINYL' : 'TURNTABLE STANDBY'}</span>
                  </div>

                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 mt-2 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 rounded-full bg-[#120409] border-4 border-[#4a1428] shadow-inner" />

                    <div
                      className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center border border-[#33111f] ${
                        isAudioPlaying ? 'animate-spin-slow' : ''
                      }`}
                      style={{
                        background:
                          'repeating-radial-gradient(circle, #1a060f 0px, #1a060f 2px, #2d0d1b 3px, #14040b 4px)',
                        boxShadow: '0 0 20px rgba(0,0,0,0.85), inset 0 0 10px rgba(244,114,182,0.15)',
                      }}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#be123c] to-[#881337] border-2 border-[#ffd700] flex flex-col items-center justify-center p-1 text-center shadow">
                        <span className="text-[7px] font-cinzel text-[#ffd700] font-bold tracking-wider leading-none">PEANUTS</span>
                        <span className="text-[8px] my-0.5">🐶🐾</span>
                        <span className="text-[6px] font-typewriter text-white/90 leading-tight">ADU RAYU</span>
                        <div className="w-2 h-2 rounded-full bg-[#14040b] border border-[#ffd700] mt-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <h4 className="font-serif text-sm font-bold text-white tracking-wide">Adu Rayu</h4>
                    <p className="font-typewriter text-[10px] text-[#fbcfe8] mt-0.5">Yovie Widianto · Tulus · Glenn Fredly</p>
                  </div>

                  <div className="w-full mt-2.5 flex items-center gap-2">
                    <span className="text-[9px] font-typewriter text-[#fbcfe8]">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 208}
                      step="0.5"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-[#4c0519] rounded-lg appearance-none cursor-pointer accent-[#f472b6]"
                    />
                    <span className="text-[9px] font-typewriter text-[#fbcfe8]">{formatTime(duration || 208)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleVinylAudio}
                    className="mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#be123c] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] text-white text-xs font-serif font-bold tracking-wide shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Jeda Lagu ⏸️</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Putar Lagu Adu Rayu 🎵</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="font-handwriting text-xs sm:text-sm text-[#be123c] mt-2.5">
                  &quot;Lagu yang paling pas buat nemenin kamu membaca buku kecil ini...&quot;
                </p>
              </div>

              <div className="w-full pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">TARIK HALAMAN KE KIRI ➔</span>
                <span>HAL. 01</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 3: SPREAD 2 LEFT (BAB I: FOTO SPESIAL CRUSH - HAL. 02)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-5 flex flex-col justify-between" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-1.5 mb-2">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB I: TENTANG SENYUMMU
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">SCRAPBOOK</span>
                </div>

                <p className="text-[11px] sm:text-xs font-serif italic text-[#4c0519] leading-snug mb-2">
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
                  className="relative bg-white p-2.5 rounded-lg shadow-md border border-[#fbcfe8] max-w-[240px] sm:max-w-[260px] mx-auto cursor-pointer group hover:rotate-1 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="washi-tape w-16 h-3.5 -top-1.5 left-5 absolute -rotate-3" />
                  <div className="washi-tape w-16 h-3.5 -top-1.5 right-5 absolute rotate-3" />

                  <div className="relative w-full h-44 sm:h-48 rounded-lg overflow-hidden bg-[#fff0f3] border border-[#fce7f3] flex items-center justify-center p-1">
                    <img
                      src="/assets/special_memory.jpg"
                      alt="Foto Spesial Jasmine ramadhania syarif"
                      className="max-h-full max-w-full object-contain mx-auto rounded shadow-2xs group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 text-[8.5px] font-typewriter text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-2.5 h-2.5 text-pink-300" />
                      <span>Perbesar</span>
                    </div>
                  </div>

                  <p className="mt-1.5 font-handwriting text-xs sm:text-sm text-[#be123c] text-center leading-snug">
                    Senyuman yang selalu bikin tenang 🌸
                  </p>
                </div>

                <div className="mt-2 p-2 sm:p-2.5 bg-[#fff1f2] border border-[#fbcfe8] rounded-lg text-[11px] sm:text-xs font-serif leading-relaxed text-[#4c0519]">
                  <p className="italic">
                    &quot;Di antara jutaan hal yang ada di dunia maya, foto dan senyum manismu ini yang selalu paling aku tunggu, Jasmine. Sederhana, tapi magisnya nyata banget bikin hati adem.&quot;
                  </p>
                </div>
              </div>

              <div className="pt-1.5 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">KLIK FOTO UNTUK MEMPERBESAR</span>
                <span>HAL. 02</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 4: SPREAD 2 RIGHT (BAB I: PUISI SASTRA & MESIN TIK - HAL. 03)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB I: SASTRA & DRAF PERASAAN
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">DRAF TULUS</span>
                </div>

                {/* Sastra Puisi Card from User */}
                <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-3.5 shadow-sm relative">
                  <div className="washi-tape w-24 h-4 -top-2 left-6 absolute" />
                  <p className="font-serif italic text-xs sm:text-[12.5px] text-[#4c0519] leading-relaxed whitespace-pre-line">
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
                <div className="mt-4 bg-[#fdf2f8] border border-[#fbcfe8] rounded-xl p-3.5 shadow-sm relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-typewriter text-[10px] text-[#9d174d] font-bold uppercase tracking-wider">
                      KERTAS ARSIP NO. 14 · MESIN TIK
                    </span>
                    <span className="text-[10px] font-typewriter text-[#be123c]">CATATAN PINK</span>
                  </div>

                  <div className="bg-white border border-[#fbcfe8] rounded-lg p-3 min-h-[90px] flex items-center shadow-inner">
                    <p className="font-typewriter text-xs text-[#3b1223] leading-relaxed">
                      {typedText}
                      <span className="inline-block w-1.5 h-3.5 bg-[#be123c] ml-1 animate-pulse" />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextTypewriter}
                    className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-[#be123c] hover:bg-[#9d174d] text-white text-[11px] font-typewriter font-semibold flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ketik Draf Surat Berikutnya ⌨️</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span>KETUK UNTUK DRAF BERIKUTNYA</span>
                <span>HAL. 03</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 5: SPREAD 3 LEFT (BAB II: WISHLIST KETEMU - HAL. 04)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB II: HARAPAN KITA
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">WISHLIST</span>
                </div>

                <p className="text-xs font-serif italic text-[#4c0519] leading-relaxed mb-3">
                  Hal-hal kecil yang pengen kulakuin bareng kamu kalau nanti kita akhirnya ketemu:
                </p>

                <div className="space-y-2 bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-3 shadow-sm">
                  {[
                    '🍜 Ajak kamu ke warung makan langganan hangat kuah & sambal, duduk berhadapan cerita tanpa canggung',
                    '🍦 Jalan santai sore sambil makan es krim dan ngobrolin hal-hal random sampai lupa waktu',
                    '☕ Ngopi santai berdua di sudut kafe hangat sambil dengerin alunan playlist kesukaan',
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#3b1223] font-serif cursor-pointer hover:bg-white/60 p-1.5 rounded transition"
                    >
                      <input
                        type="checkbox"
                        checked={wishlistChecked[idx]}
                        onChange={() => {
                          sound.playPencilSound();
                          const next = [...wishlistChecked];
                          next[idx] = !next[idx];
                          setWishlistChecked(next);
                        }}
                        className="mt-0.5 rounded border-[#f472b6] text-[#be123c] focus:ring-[#be123c]"
                      />
                      <span className={wishlistChecked[idx] ? 'line-through text-[#9d174d]' : ''}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-3.5">
                  <span className="font-typewriter text-[10px] text-[#9d174d] font-bold block mb-1">
                    TAMBAH IMPIAN KITA BERDUA:
                  </span>
                  <input
                    type="text"
                    value={coupleGoal}
                    onChange={(e) => setCoupleGoal(e.target.value)}
                    className="w-full text-xs font-serif bg-white border border-[#fbcfe8] rounded-lg p-2 text-[#3b1223] focus:outline-none focus:border-[#be123c]"
                    placeholder="Tulis impian kencan yang kamu mau..."
                  />
                </div>

                <div className="mt-3">
                  <span className="font-typewriter text-[10px] text-[#9d174d] font-bold block mb-1">
                    GIMANA PERASAANMU BACA BUKU INI?
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      'Senyum-senyum sendiri',
                      'Deg-degan manis',
                      'Terharu banget',
                      'Bunga-bunga di hati',
                    ].map((mood, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sound.playWaxSealStampSound();
                          setSelectedMood(mood);
                          showToast(`Mood: ${mood}`);
                        }}
                        className={`text-[10px] font-typewriter py-1 px-2 rounded-lg border transition text-left cursor-pointer ${
                          selectedMood === mood
                            ? 'bg-[#be123c] text-white border-[#be123c] font-bold shadow-xs'
                            : 'bg-white text-[#4c0519] border-[#fbcfe8] hover:bg-[#fce7f3]'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span>KERTAS HARAPAN NO. 07</span>
                <span>HAL. 04</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 6: SPREAD 3 RIGHT (BAB II: DRAF SEBELUM CONFESS - HAL. 05)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet paper-ruled page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB II: DRAF SEBELUM CONFESS
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">SURAT JUJUR</span>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#3b1223] mb-2">
                  Satu Pengakuan Tulus Dari Lubuk Hati
                </h3>

                <div className="bg-[#fff1f2]/80 border border-[#fbcfe8] rounded-xl p-3.5 shadow-sm text-xs sm:text-[13px] text-[#3b1223] font-serif leading-relaxed space-y-2.5">
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

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#be123c]">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="font-serif italic text-[11px]">Sincere Gentleman</span>
                  </div>
                  <span className="font-handwriting text-base text-[#be123c]">
                    — Dengan tulus, {state.sender}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">DRAF TERAKHIR SEBELUM CONFESS</span>
                <span>HAL. 05</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 7: SPREAD 4 LEFT (BAB III: WILL YOU BE MINE? - HAL. 06)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-6 flex flex-col justify-between items-center text-center relative page-scroll overflow-y-auto" data-density="soft">
              <div className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB III: SATU PERTANYAAN JUJUR
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">CONFESSION 💖</span>
                </div>

                <div className="relative my-2 w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#f472b6] shadow-md bg-white">
                  <Image
                    src="/assets/snoopy_flower_bouquet.jpg"
                    alt="Snoopy membawa bunga mawar pink"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="my-2 space-y-1.5 max-w-sm">
                  <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#be123c] leading-tight">
                    Will you be mine? 💖
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#4c0519] font-serif leading-relaxed">
                    {state.finalQuestion ||
                      'Dari sekian banyak orang di dunia, hatiku cuma memilih kamu. Maukah kamu jadi pacarku dan mulai melangkah bareng aku?'}
                  </p>
                </div>

                {state.accepted ? (
                  <div className="mt-2 p-3 bg-gradient-to-r from-[#fce7f3] to-[#ffe4e6] border border-[#f472b6] rounded-xl text-center shadow-md animate-bounce-subtle">
                    <span className="text-xl block">🎉👩‍❤️‍👨💖</span>
                    <strong className="text-xs sm:text-sm text-[#be123c] block font-serif">
                      YAYYY! Mulai hari ini kita resmi berpacaran! 💖
                    </strong>
                    <p className="text-[11px] text-[#4c0519] mt-0.5">
                      Terima kasih sudah memilih berjalan bersamaku. Aku janji bakal jaga senyumanmu setiap hari! 🌸
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 w-full max-w-xs space-y-2">
                    <button
                      type="button"
                      onClick={handleAcceptClick}
                      className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#be123c] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] text-white text-xs sm:text-sm font-serif font-bold tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current animate-pulse text-pink-200" />
                      <span>Iya, Aku Mau! 💖</span>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    </button>

                    <button
                      type="button"
                      onClick={handleShyClick}
                      className="w-full py-1.5 px-3 rounded-full bg-white hover:bg-[#fff1f2] border border-[#fbcfe8] text-[#be123c] text-[11px] font-typewriter transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Masih Malu-malu 🙈</span>
                    </button>

                    <p className="text-[10px] font-typewriter text-[#9d174d] italic mt-1">
                      {shyPrompt}
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span>LEMBAR KEPUTUSAN HATI</span>
                <span>HAL. 06</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 8: SPREAD 4 RIGHT (BAB III: KARTU BALASAN RESMI & WHATSAPP - HAL. 07)
                 ========================================================================= */}
            <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
              <div>
                <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                  <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                    BAB III: KARTU BALASAN RESMI
                  </span>
                  <span className="font-typewriter text-[11px] text-[#9d174d]">TIKET CINTA 💌</span>
                </div>

                <div className="bg-[#fff1f2] border-2 border-[#f472b6] rounded-xl p-3.5 shadow-md relative">
                  <div className="washi-tape w-20 h-4 -top-2 left-6 absolute" />
                  <div className="flex items-center justify-between border-b border-dashed border-[#fbcfe8] pb-2 mb-2">
                    <div>
                      <span className="text-[9px] font-typewriter text-[#9d174d] uppercase block font-bold">
                        TIKET MASA DEPAN KITA
                      </span>
                      <strong className="text-xs font-serif text-[#3b1223]">
                        TUJUAN: HARI-HARI BAHAGIA BERDUA
                      </strong>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c] font-bold">
                      {state.accepted ? 'RESMI PACARAN 💖' : 'READY TO BOARD'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-typewriter border-b border-dashed border-[#fbcfe8] pb-2 mb-2">
                    <div>
                      <span className="text-[#9d174d] text-[9px] block">PENUMPANG:</span>
                      <span className="text-[#3b1223] font-bold">{state.recipient || 'Jasmine ramadhania syarif'}</span>
                    </div>
                    <div>
                      <span className="text-[#9d174d] text-[9px] block">TUJUAN KE HATI:</span>
                      <span className="text-[#3b1223] font-bold">{state.sender}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-typewriter text-[#9d174d] font-bold block mb-1">
                      PESAN BALASAN DARI KAMU:
                    </span>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full text-xs font-serif bg-white border border-[#fbcfe8] rounded-lg p-2 text-[#3b1223] focus:outline-none focus:border-[#be123c]"
                      placeholder="Tulis pesan manismu di sini..."
                    />
                  </div>
                </div>

                <div className="mt-3.5 space-y-2">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#25d366] to-[#128c7e] hover:from-[#128c7e] hover:to-[#25d366] text-white text-xs sm:text-sm font-serif font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Kirim Jawaban Manis ke WhatsApp 💌</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-[#fff1f2] border border-[#fbcfe8] text-[#be123c] text-xs font-typewriter transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin ke Clipboard! ✨' : 'Salin Pesan Balasan 📋'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                <span className="text-[#be123c] font-semibold">AKHIR BUKU KECIL · AWAL KITA BERDUA 🌸</span>
                <span>HAL. 07</span>
              </div>
            </div>

            {/* =========================================================================
                 PAGE 9: BACK HARDCOVER (VINTAGE BAROQUE VECTOR FRAME)
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

              <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-6 sm:px-8 py-7 sm:py-9">
                <div className="pt-2 sm:pt-3">
                  <span className="font-cinzel text-[9.5px] sm:text-[10px] tracking-[0.35em] text-[#fbcfe8] uppercase font-bold drop-shadow">
                    ★ AKHIR CATATAN PINK ★
                  </span>
                </div>

                <div className="my-auto flex flex-col items-center w-full max-w-xs">
                  <div className="w-14 h-14 rounded-full bg-[#5c1d38] border-2 border-[#f472b6] flex items-center justify-center text-2xl my-2 shadow-inner">
                    🌸
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-[#ffd700] tracking-widest uppercase mt-2">
                    PEANUTS ARCHIVE
                  </h3>
                  <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-[#f472b6] to-transparent my-2" />
                  <p className="font-handwriting text-lg text-[#fce7f3] leading-snug">
                    &quot;Terima kasih sudah membaca sampai lembar terakhir. Semoga kita bisa segera ketemu dan bikin cerita indah bareng. 🌸&quot;
                  </p>
                  <div className="mt-4 pt-2 border-t border-dashed border-[#f472b6]/40 w-full text-[10px] font-typewriter text-[#fce7f3]">
                    TANDA TANGAN: <span className="text-white font-bold">{state.sender}</span>
                  </div>
                </div>

                <div className="pb-1 sm:pb-2">
                  <div className="px-4 py-1.5 rounded-full bg-[#240a17]/90 border border-[#f472b6]/60 text-[#fce7f3] text-[10px] font-cinzel tracking-wider">
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
