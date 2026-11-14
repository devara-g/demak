'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
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
  '"Sebenarnya setiap kali kita berpapasan, jantungku masih suka salah tingkah sendiri..."',
  '"Kadang aku sengaja balas chat agak cepat, karena emang sesenang itu ngobrol sama kamu."',
  '"Waktu lihat Snoopy natap langit berbintang, yang kepikiran di kepalaku cuma senyummu."',
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
  if (spreadIndex <= 1) return 0;
  return (spreadIndex - 1) * 2;
};

const pageToSpread = (pageIndex: number): number => {
  return Math.floor(pageIndex / 2) + 1;
};

export const FlipBook = forwardRef<FlipBookRef, FlipBookProps>(function FlipBook(
  { state, onSpreadChange, onAccept, showToast, externalSpread },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);

  const [isCoverClosed, setIsCoverClosed] = useState(state.currentSpread === 0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Audio / Vinyl State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(208); // 3m 28s default for Adu Rayu

  // Typewriter
  const [lineIdx, setLineIdx] = useState(0);
  const [typedText, setTypedText] = useState(typewriterLines[0]);
  const [isTyping, setIsTyping] = useState(false);

  // Wishlist & Confession
  const [wishlistChecked, setWishlistChecked] = useState([true, true, true]);
  const [coupleGoal, setCoupleGoal] = useState('Makan di warung langganan hangat kuah & sambal 🍜💖');
  const [selectedMood, setSelectedMood] = useState(state.selectedMood || 'Senyum-senyum sendiri 😊');
  const [replyText, setReplyText] = useState('Iya, aku mau! Mulai hari ini kita pacaran yaa 💖');
  const [shyIdx, setShyIdx] = useState(0);
  const [shyPrompt, setShyPrompt] = useState('Snoopy menatap penuh harap menunggumu... 🐶💖');
  const [copied, setCopied] = useState(false);

  // Polaroid Lightbox
  const [selectedPolaroid, setSelectedPolaroid] = useState<{
    src: string;
    caption: string;
    chapter: string;
  } | null>(null);

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Subscribe to audio time & status
  useEffect(() => {
    const unsubTime = sound.onTimeUpdate((cur: number, dur: number) => {
      setCurrentTime(cur);
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

  // PageFlip Initialization
  const initPageFlip = () => {
    if (!containerRef.current || pageFlipRef.current) return;
    if (containerRef.current.offsetWidth < 550) return;

    try {
      const pageFlip = new PageFlip(containerRef.current, {
        width: 480,
        height: 600,
        size: 'stretch',
        minWidth: 320,
        maxWidth: 620,
        minHeight: 420,
        maxHeight: 750,
        maxShadowOpacity: 0.35,
        showCover: false,
        mobileScrollSupport: false,
        flippingTime: 850,
        useMouseEvents: true,
        clickEventForward: true,
        disableFlipByClick: true,
        usePortrait: false,
        startPage: spreadToPage(state.currentSpread || 1),
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
            sound.playPaperTurnSound();
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
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Window resize updater for PageFlip
  useEffect(() => {
    const handleResize = () => {
      if (pageFlipRef.current && !isCoverClosed) {
        try {
          (pageFlipRef.current as any).update();
        } catch (e) {}
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCoverClosed]);

  const handleOpenBook = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    sound.playPaperTurnSound();
    setIsCoverClosed(false);
    setTimeout(() => {
      setIsFlipping(false);
      onSpreadChange(1);
      if (!pageFlipRef.current) {
        initPageFlip();
      } else {
        pageFlipRef.current.turnToPage(0);
        try {
          (pageFlipRef.current as any).update();
        } catch (e) {}
      }
    }, 850);
  };

  const handleCloseBook = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    sound.playPaperTurnSound();
    setIsCoverClosed(true);
    setTimeout(() => {
      setIsFlipping(false);
      onSpreadChange(0);
    }, 850);
  };

  useImperativeHandle(
    ref,
    () => ({
      flipNext: () => {
        if (isFlipping) return;
        if (isCoverClosed) {
          handleOpenBook();
        } else if (pageFlipRef.current) {
          const curPage = pageFlipRef.current.getCurrentPageIndex();
          const curSpread = pageToSpread(curPage);
          if (curSpread < 4) {
            sound.playPaperTurnSound();
            try {
              pageFlipRef.current.flipNext('bottom');
            } catch (e) {
              pageFlipRef.current.turnToNextPage();
            }
          }
        }
      },
      flipPrev: () => {
        if (isFlipping) return;
        if (pageFlipRef.current) {
          const curPage = pageFlipRef.current.getCurrentPageIndex();
          const curSpread = pageToSpread(curPage);
          if (curSpread <= 1) {
            handleCloseBook();
          } else {
            sound.playPaperTurnSound();
            try {
              pageFlipRef.current.flipPrev('bottom');
            } catch (e) {
              pageFlipRef.current.turnToPrevPage();
            }
          }
        }
      },
      flipToSpread: (targetSpread: number) => {
        if (isFlipping) return;
        if (targetSpread === 0) {
          handleCloseBook();
        } else if (isCoverClosed) {
          handleOpenBook();
          if (targetSpread > 1) {
            setTimeout(() => {
              if (pageFlipRef.current) {
                const targetPage = spreadToPage(targetSpread);
                try {
                  pageFlipRef.current.flip(targetPage, 'bottom');
                } catch (e) {
                  pageFlipRef.current.turnToPage(targetPage);
                }
              }
            }, 900);
          }
        } else if (pageFlipRef.current) {
          const targetPage = spreadToPage(targetSpread);
          const curPage = pageFlipRef.current.getCurrentPageIndex();
          if (pageToSpread(curPage) !== targetSpread) {
            sound.playPaperTurnSound();
            try {
              pageFlipRef.current.flip(targetPage, 'bottom');
            } catch (e) {
              pageFlipRef.current.turnToPage(targetPage);
            }
          }
        }
      },
      openBook: handleOpenBook,
      closeBook: handleCloseBook,
    }),
    [isCoverClosed, isFlipping]
  );

  // External spread navigation sync
  useEffect(() => {
    if (state.currentSpread === 0) {
      if (!isCoverClosed && !isFlipping) {
        handleCloseBook();
      }
    } else {
      if (isCoverClosed && !isFlipping) {
        handleOpenBook();
      } else if (pageFlipRef.current) {
        const targetPage = spreadToPage(state.currentSpread);
        const curPage = pageFlipRef.current.getCurrentPageIndex();
        if (pageToSpread(curPage) !== state.currentSpread) {
          try {
            pageFlipRef.current.flip(targetPage, 'bottom');
          } catch (e) {
            pageFlipRef.current.turnToPage(targetPage);
          }
        }
      }
    }
  }, [state.currentSpread]);

  // Clean WhatsApp URL Generation without corrupted characters
  const getWhatsAppUrl = () => {
    let cleanPhone = (state.whatsappNumber || '081221995470').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const note = replyText.trim() || 'Iya, aku mau jadi pacarmu! 💖';
    const waMsg = `Halo ${state.sender}! 💖✨\n\nIya, aku mau jadi pacarmu! 👫💖\nAku udah baca seluruh lembaran buku "${state.bookTitle || 'Tentang Kamu & Nuansa Pink'}" yang kamu bikin buat aku... Sumpah aku terharu banget baca setiap kata dan draf suratnya 🥺🌸\n\nPerasaanku pas baca: "${selectedMood}"\nHal pertama yang paling aku tunggu bareng kamu:\n"${coupleGoal}"\n\nPesan manis dariku:\n"${note}"\n\nMulai hari ini kita resmi berpacaran yaa! Semoga hari-hari kita selalu hangat, penuh tawa, dan bahagia berdua bareng Snoopy 💖✨`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
  };

  const handleOpenWhatsApp = () => {
    let cleanPhone = (state.whatsappNumber || '081221995470').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const note = replyText.trim() || 'Iya, aku mau jadi pacarmu! 💖';
    const waMsg = `Halo ${state.sender}! 💖✨\n\nIya, aku mau jadi pacarmu! 👫💖\nAku udah baca seluruh lembaran buku "${state.bookTitle || 'Tentang Kamu & Nuansa Pink'}" yang kamu bikin buat aku... Sumpah aku terharu banget baca setiap kata dan draf suratnya 🥺🌸\n\nPerasaanku pas baca: "${selectedMood}"\nHal pertama yang paling aku tunggu bareng kamu:\n"${coupleGoal}"\n\nPesan manis dariku:\n"${note}"\n\nMulai hari ini kita resmi berpacaran yaa! Semoga hari-hari kita selalu hangat, penuh tawa, dan bahagia berdua bareng Snoopy 💖✨`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(waMsg).catch(() => {});
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
    window.open(url, '_blank');
    showToast('Membuka WhatsApp! Pesan manis juga tersalin ke clipboard 💖');
  };

  const handleRejectTikTok = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPaperTurnSound();
    const username = (state.tiktokUsername || '').trim().replace(/^@/, '');
    const tiktokUrl = username ? `https://www.tiktok.com/@${username}` : 'https://www.tiktok.com/messages';
    const rejectMsg = `Hai ${state.sender}, makasih banyak yaa udah bikin buku seindah ini buat aku... Aku terharu banget bacanya. Tapi maaf ya untuk sekarang kita ngobrol santai di TikTok dulu yaa 🙏✨`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rejectMsg).catch(() => {});
    }
    setShyPrompt('Snoopy tersenyum memelukmu... Gapapa, kita ngobrol santai di TikTok ya 🐶💬');
    showToast('Makasih udah jujur... Mengalihkan ke TikTok PM 🥺💬');
    setTimeout(() => {
      window.open(tiktokUrl, '_blank');
    }, 500);
  };

  const handleSayYes = () => {
    sound.playWaxSealStampSound();
    sound.playCelebrationChord();
    onAccept();

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fbcfe8', '#ffd700'],
    });

    setShyPrompt('Snoopy menari gembira! Kita resmi pacaran! 🐶💖✨');
    showToast('Yeay! Jawabanmu diterima! Mengalihkan ke WhatsApp... 💖');

    setTimeout(() => {
      handleOpenWhatsApp();
    }, 700);
  };

  const handleShy = () => {
    sound.playPaperTurnSound();
    const msg = shyResponses[shyIdx % shyResponses.length];
    setShyIdx(shyIdx + 1);
    setShyPrompt(msg);
    showToast(msg);
  };

  const officialCertificateText = `SURAT RESMI HUBUNGAN 💖
=============================
PASANGAN : ${state.recipient} & ${state.sender}
STATUS   : RESMI BERPACARAN 💖
TANGGAL  : ${state.dateBadge}
LAGU KITA: Adu Rayu — Yovie, Tulus, Glenn
=============================
Diresmikan dengan tulus di bawah naungan Catatan Pink & Snoopy.`;

  const handleCopyCertificate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(officialCertificateText).then(() => {
        setCopied(true);
        showToast('Surat resmi pacaran berhasil disalin! 💖');
        setTimeout(() => setCopied(false), 2400);
      });
    }
  };

  const typeNextDraft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTyping) return;
    sound.playTypewriterBellSound();
    setIsTyping(true);
    const nextIdx = (lineIdx + 1) % typewriterLines.length;
    setLineIdx(nextIdx);
    const fullText = typewriterLines[nextIdx];
    let cur = '';
    let i = 0;

    const interval = setInterval(() => {
      if (i < fullText.length) {
        cur += fullText[i];
        setTypedText(cur);
        sound.playTypewriterKeySound();
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 45);
  };

  return (
    <main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 flex items-center justify-center min-h-0">
      {/* Soft Ambient Desk Shadow */}
      <div className="absolute -bottom-5 left-8 right-8 h-14 bg-black/75 blur-2xl rounded-full pointer-events-none" />

      {/* =========================================================================
          UNIFIED 3D HARDCOVER BOOK (CENTERED WHEN CLOSED, FULL SPREAD WHEN OPEN)
          ========================================================================= */}
      <div
        className={`relative mx-auto transition-all duration-[850ms] flex items-center justify-center ${
          isCoverClosed
            ? 'w-full max-w-[420px] sm:max-w-[450px] h-[540px] sm:h-[580px] md:h-[610px]'
            : 'w-full max-w-5xl h-[530px] sm:h-[570px] md:h-[600px] max-h-[625px]'
        }`}
        style={{
          perspective: '2500px',
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* 3D Stacked Paper Edge on Right */}
        <div
          className="absolute -right-3 top-3.5 bottom-3.5 w-3.5 rounded-r border-r border-[#f472b6]/60 pointer-events-none z-10"
          style={{
            background: 'repeating-linear-gradient(to bottom, #fed7aa 0px, #fff1f2 1px, #fbcfe8 2px, #fffaf5 3px)',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.35), 4px 0 10px rgba(0,0,0,0.5)',
          }}
        />

        {/* 3D Stacked Paper Edge at Bottom */}
        <div
          className="absolute -bottom-2.5 left-4 right-2 h-3 rounded-b border-b border-[#f472b6]/60 pointer-events-none z-10"
          style={{
            background: 'repeating-linear-gradient(to right, #fed7aa 0px, #fff1f2 1px, #fbcfe8 2px, #fffaf5 3px)',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.35), 0 5px 10px rgba(0,0,0,0.55)',
          }}
        />

        {/* -------------------------------------------------------------------------
            3D ROTATING HARDCOVER BOARD (FLIPS 180° IN REAL 3D SPACE)
            ------------------------------------------------------------------------- */}
        <div
          className="absolute top-0 bottom-0 pointer-events-auto z-40 transition-transform duration-[850ms]"
          style={{
            left: isCoverClosed ? '0' : '50%',
            width: isCoverClosed ? '100%' : '50%',
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transform: isCoverClosed ? 'rotateY(0deg)' : 'rotateY(-180deg)',
            transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
            display: isCoverClosed || isFlipping || state.currentSpread === 0 ? 'block' : 'none',
          }}
        >
          {/* FRONT FACE (Velvet Burgundy Leather Cover + Baroque Gold Frame + Snoopy Cameo) */}
          <div
            onClick={handleOpenBook}
            className="absolute inset-0 w-full h-full rounded-r-xl overflow-hidden cursor-pointer select-none group shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: '#3b1223',
              boxShadow: '0 30px 70px -10px rgba(0,0,0,0.9), inset 0 0 35px rgba(0,0,0,0.9)',
            }}
          >
            {/* 3D Rounded Book Spine on the Left Edge */}
            <div
              className="absolute top-0 bottom-0 left-0 w-7 pointer-events-none z-30"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(255,255,255,0.08) 20%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.8)',
              }}
            />

            {/* Background Frame SVG (Baroque Gold Filigree Border) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-75">
              <Image
                src="/assets/baroque_cover_frame.svg"
                alt="Vintage Baroque Gold Filigree Frame"
                fill
                className="object-fill"
                priority
              />
            </div>

            {/* Cover Content Layer */}
            <div className="relative z-20 w-full h-full flex flex-col justify-between items-center px-6 sm:px-8 py-7 sm:py-9 text-center">
              {/* Top Header */}
              <div className="pt-2 sm:pt-3">
                <span className="font-cinzel text-[9.5px] sm:text-[10px] tracking-[0.35em] text-[#fbcfe8] uppercase font-bold drop-shadow">
                  PEANUTS ARCHIVAL · EDISI PINK
                </span>
              </div>

              {/* Centerpiece: Title, Snoopy Plaque, Dedication */}
              <div className="my-auto flex flex-col items-center w-full">
                <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.16em] uppercase text-[#ffd700] drop-shadow-md leading-tight">
                  {state.bookTitle || 'TENTANG KAMU & NUANSA PINK'}
                </h1>
                <p className="font-cinzel text-[10px] sm:text-[11px] tracking-[0.22em] text-[#fbcfe8] font-semibold mt-1">
                  ✦ SEBUAH BUKU KECIL UNTUKMU ✦
                </p>

                {/* Snoopy Plaque in Rose Gold Frame */}
                <div className="relative mt-4 p-1.5 sm:p-2 rounded-xl bg-gradient-to-b from-[#5c1d38] to-[#2a0c18] border-2 border-[#f472b6] shadow-[0_12px_28px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-500">
                  <div className="relative w-40 sm:w-48 h-28 sm:h-32 rounded-lg overflow-hidden border border-[#fbcfe8]/60">
                    <Image
                      src="/assets/snoopy_starry_night.jpg"
                      alt="Snoopy di atas rumah anjing menatap bintang malam"
                      fill
                      className="object-cover"
                      sizes="200px"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#be123c] text-white font-cinzel text-[8.5px] sm:text-[9px] font-bold tracking-wider uppercase shadow">
                    SNOOPY & WOODSTOCK
                  </div>
                </div>

                {/* Dedication Plate */}
                <div className="mt-4 px-3 sm:px-4 py-1 rounded bg-[#240a17]/90 border border-[#f472b6]/70 shadow-md">
                  <p className="font-cinzel text-[9.5px] sm:text-[10px] text-[#fce7f3] tracking-wider font-semibold">
                    UNTUK: <span className="text-white font-bold">{state.recipient}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Interactive Open Hint */}
              <div className="pb-1 sm:pb-2">
                <div className="px-5 py-2 rounded-full bg-gradient-to-r from-[#9d174d] via-[#be123c] to-[#9d174d] border border-[#fbcfe8]/80 text-white text-xs font-cinzel tracking-widest font-bold shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
                  <span>❖ BUKA SAMPUL BUKU ➔ ❖</span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE (Inside Front Cover / Ex-Libris Bookplate) */}
          <div
            className="absolute inset-0 w-full h-full rounded-l-xl overflow-hidden select-none p-6 flex flex-col justify-between"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: '#3b1223',
              boxShadow: 'inset 0 0 45px rgba(0,0,0,0.9)',
            }}
          >
            <div className="relative z-10 my-auto text-center flex flex-col items-center p-5 bg-[#240a17]/90 rounded-xl border border-[#f472b6]/60 shadow-xl max-w-xs mx-auto">
              <span className="font-cinzel text-[9px] tracking-[0.3em] text-[#fbcfe8] uppercase font-bold block mb-1">
                PEANUTS ARCHIVAL COLLECTION
              </span>
              <div className="w-12 h-12 rounded-full bg-[#5c1d38] border border-[#f472b6] flex items-center justify-center text-xl my-2 shadow-inner">
                🌸
              </div>
              <h3 className="font-cinzel text-base font-bold text-white tracking-widest uppercase">
                EX-LIBRIS
              </h3>
              <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-[#f472b6] to-transparent my-2" />
              <p className="font-handwriting text-lg text-[#fce7f3] leading-tight">
                &quot;Buku kecil ini dirawat khusus untuk menemani harimu.&quot;
              </p>
              <div className="mt-3 pt-2 border-t border-dashed border-[#f472b6]/40 w-full text-[10px] font-typewriter text-[#fbcfe8]">
                DEDIKASI: <span className="text-white font-bold">{state.recipient}</span>
              </div>
            </div>

            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* -------------------------------------------------------------------------
            OPEN BOOK BASE CASING (AUTHENTIC HARDCOVER BORDER & SILK HEADBAND)
            ------------------------------------------------------------------------- */}
        <div
          className={`relative w-full h-full bg-[#3b1223] rounded-xl shadow-2xl border border-[#f472b6]/40 flex flex-col justify-between overflow-visible transition-opacity duration-500 ${
            isCoverClosed && !isFlipping ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          style={{
            padding: '3px',
            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.85), inset 0 0 25px rgba(0,0,0,0.8)',
          }}
        >
          {/* Metal Corner Guards */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#f472b6] rounded-tl pointer-events-none z-30" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-[#f472b6] rounded-tr pointer-events-none z-30" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-[#f472b6] rounded-bl pointer-events-none z-30" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#f472b6] rounded-br pointer-events-none z-30" />

          {/* Spine Headband Fabric */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#9d174d] via-[#f472b6] to-[#9d174d] rounded-full shadow pointer-events-none z-10" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-gradient-to-r from-[#9d174d] via-[#f472b6] to-[#9d174d] rounded-full shadow pointer-events-none z-10" />

          {/* Silk Bookmark Ribbon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playPaperTurnSound();
              setIsDrawerOpen(!isDrawerOpen);
            }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-8 bg-gradient-to-r from-[#be123c] via-[#e11d48] to-[#9d174d] shadow-md z-10 rounded-t-sm hover:translate-y-0.5 transition-transform group cursor-pointer"
            title="Klik untuk membuka Pembatas Buku & Daftar Isi"
          >
            <div className="absolute -bottom-1.5 left-0 w-0 h-0 border-l-[10px] border-l-[#9d174d] border-r-[10px] border-r-[#9d174d] border-b-[6px] border-b-transparent" />
          </button>

          {/* Inner StPageFlip Shell (Cream Ivory Paper) */}
          <div className="relative w-full h-full rounded-sm overflow-hidden bg-[#fffaf5]">
            <div ref={containerRef} className="w-full h-full">

              {/* ================= PAGE 1: SPREAD 1 LEFT (DEDIKASI & SURAT PEMBUKA) ================= */}
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

                  {/* Artisanal Dedication Card */}
                  <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-3.5 shadow-sm relative">
                    <div className="washi-tape w-24 h-5 -top-2.5 left-8 absolute rotate-[-2deg]" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif italic text-xs text-[#be123c] font-bold">Lembar Persembahan</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c] font-medium">Khusus Untukmu 💖</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-serif border-t border-dashed border-[#fbcfe8] pt-2">
                      <div>
                        <span className="text-[10px] font-typewriter text-[#9d174d] block font-bold">UNTUK:</span>
                        <strong className="text-[#3b1223] text-sm">{state.recipient}</strong>
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
                    <span>Tips: Tarik ujung sudut kertas untuk membalik halaman!</span>
                  </div>
                  <span className="font-typewriter text-[10px] text-[#9d174d]">HAL. 00</span>
                </div>
              </div>

              {/* ================= PAGE 2: SPREAD 1 RIGHT (RETRO VINYL TURNTABLE PLAYER) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between items-center text-center relative page-scroll overflow-y-auto" data-density="soft">
                <div className="w-full flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                    <span className="font-typewriter text-[10.5px] uppercase tracking-widest text-[#be123c] font-bold">
                      PEANUTS ARCHIVAL · VINYL EDITION
                    </span>
                    <span className="font-typewriter text-[11px] text-[#9d174d]">ADU RAYU 🎵</span>
                  </div>

                  {/* Retro Turntable Box */}
                  <div className="relative w-full max-w-[290px] sm:max-w-[320px] bg-gradient-to-b from-[#2a0c18] to-[#19050d] rounded-2xl p-4 sm:p-5 border-2 border-[#f472b6] shadow-xl flex flex-col items-center">
                    <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] font-typewriter text-[#fbcfe8]">
                      <span className={`w-2 h-2 rounded-full ${isAudioPlaying ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                      <span>{isAudioPlaying ? 'PLAYING VINYL' : 'TURNTABLE STANDBY'}</span>
                    </div>

                    {/* Turntable Platter & Vinyl Record */}
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 mt-2 rounded-full flex items-center justify-center shadow-2xl">
                      {/* Turntable base platter ring */}
                      <div className="absolute inset-0 rounded-full bg-[#120409] border-4 border-[#4a1428] shadow-inner" />

                      {/* Spinning Vinyl Record Disc */}
                      <div
                        className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-[#0d0306] flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-700 ${
                          isAudioPlaying ? 'animate-spin' : ''
                        }`}
                        style={{
                          animationDuration: '3.5s',
                          backgroundImage:
                            'radial-gradient(circle, #2a0816 18%, #14030a 28%, #2e0918 42%, #14030a 56%, #2a0816 70%, #14030a 85%, #050103 100%)',
                          boxShadow: '0 0 15px rgba(0,0,0,0.8), inset 0 0 8px rgba(255,255,255,0.08)',
                        }}
                        onClick={toggleVinylAudio}
                        title="Klik untuk memutar / menjeda lagu"
                      >
                        {/* Micro-groove sheen highlights */}
                        <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
                        <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none" />
                        <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                        <div className="absolute inset-11 rounded-full border border-white/5 pointer-events-none" />

                        {/* Center Pink Paper Label */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-[#f43f5e] via-[#be123c] to-[#881337] border-2 border-[#fbcfe8] flex flex-col items-center justify-center shadow-inner text-center p-1 z-10">
                          <span className="text-white text-xs">💖</span>
                          <span className="text-[7.5px] font-bold text-white tracking-wider leading-none mt-0.5">
                            ADU RAYU
                          </span>
                          <span className="text-[6.5px] text-[#fce7f3] leading-none">PEANUTS</span>
                        </div>

                        {/* Spindle hole */}
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-600 z-20" />
                      </div>

                      {/* Tonearm */}
                      <div
                        className="absolute -top-1 -right-1 w-16 h-28 pointer-events-none z-30 transition-transform duration-700 origin-top-right"
                        style={{
                          transform: isAudioPlaying ? 'rotate(18deg)' : 'rotate(-8deg)',
                        }}
                      >
                        {/* Pivot base */}
                        <div className="absolute top-0 right-1 w-6 h-6 rounded-full bg-[#3d1222] border-2 border-[#f472b6] shadow" />
                        {/* Metal arm rod */}
                        <div className="absolute top-4 right-3.5 w-1 h-20 bg-gradient-to-b from-[#e5e7eb] via-[#9ca3af] to-[#d1d5db] shadow rounded" />
                        {/* Cartridge & Needle */}
                        <div className="absolute bottom-1 right-2 w-3.5 h-6 bg-[#be123c] border border-white/40 rounded-sm shadow" />
                      </div>
                    </div>

                    {/* Song Title & Artist */}
                    <div className="mt-3 text-center">
                      <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
                        Adu Rayu
                      </h4>
                      <p className="text-[11px] text-[#fbcfe8] font-typewriter">
                        Yovie Widianto, Tulus, Glenn Fredly
                      </p>
                    </div>

                    {/* Scrubber Bar & Live Duration */}
                    <div className="w-full mt-2.5 px-2">
                      <input
                        type="range"
                        min={0}
                        max={duration || 208}
                        step={0.5}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-[#4c162b] rounded-lg appearance-none cursor-pointer accent-[#f43f5e]"
                      />
                      <div className="flex justify-between text-[10px] font-typewriter text-[#fbcfe8] mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Play / Pause Toggle Button */}
                    <button
                      type="button"
                      onClick={toggleVinylAudio}
                      className="mt-2.5 px-4 py-1.5 rounded-full bg-[#be123c] hover:bg-[#e11d48] text-white text-xs font-semibold shadow-md border border-[#fbcfe8]/60 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-white" />
                          <span>Jeda Lagu</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Putar Lagu</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Romantic Music Quote */}
                  <p className="mt-3 font-handwriting text-base sm:text-lg text-[#be123c] italic leading-snug">
                    &quot;Setiap liriknya mendadak terasa seperti tentangmu.&quot;
                  </p>
                </div>

                <div className="w-full pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>LAGU KENANGAN</span>
                  <span>HAL. 01</span>
                </div>
              </div>

              {/* ================= PAGE 3: SPREAD 2 LEFT (BAB I: KILAS KENANGAN KITA) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
                <div>
                  <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                    <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                      BAB I: KILAS KENANGAN KITA
                    </span>
                    <span className="font-typewriter text-[11px] text-[#9d174d]">SCRAPBOOK</span>
                  </div>

                  <p className="text-xs font-serif italic text-[#4c0519] leading-relaxed mb-3">
                    Ada banyak momen sederhana bareng kamu yang tersimpan rapi di sini:
                  </p>

                  {/* Polaroid Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Polaroid 1 */}
                    <div
                      onClick={() =>
                        setSelectedPolaroid({
                          src: '/assets/snoopy_flower_bouquet.jpg',
                          caption: 'Snoopy membawa bunga mawar pink khusus untukmu 🌸',
                          chapter: 'Mawar & Senyuman',
                        })
                      }
                      className="bg-white p-2 rounded shadow-md border border-[#fbcfe8] rotate-[-2deg] hover:rotate-0 hover:scale-105 transition cursor-pointer group"
                    >
                      <div className="relative w-full h-24 rounded overflow-hidden">
                        <Image
                          src="/assets/snoopy_flower_bouquet.jpg"
                          alt="Snoopy membawa bunga"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-1.5 font-handwriting text-xs text-[#be123c] text-center leading-none">
                        Bunga untukmu 🌸
                      </p>
                    </div>

                    {/* Polaroid 2 */}
                    <div
                      onClick={() =>
                        setSelectedPolaroid({
                          src: '/assets/snoopy_blue_umbrella.jpg',
                          caption: 'Berbagi payung saat gerimis sore di kota ini ☔',
                          chapter: 'Gerimis & Payung',
                        })
                      }
                      className="bg-white p-2 rounded shadow-md border border-[#fbcfe8] rotate-[2deg] hover:rotate-0 hover:scale-105 transition cursor-pointer group"
                    >
                      <div className="relative w-full h-24 rounded overflow-hidden">
                        <Image
                          src="/assets/snoopy_blue_umbrella.jpg"
                          alt="Snoopy di bawah payung"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-1.5 font-handwriting text-xs text-[#be123c] text-center leading-none">
                        Payung berdua ☔
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#fff1f2] border border-[#fbcfe8] rounded-xl text-xs font-serif leading-relaxed text-[#4c0519]">
                    <p className="italic">
                      &quot;Aku suka caramu tertawa pas kita cerita hal-hal sepele. Rasanya ringan banget, dan hari-hari yang capek mendadak jadi hangat.&quot;
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>KLIK FOTO UNTUK MEMPERBESAR</span>
                  <span>HAL. 02</span>
                </div>
              </div>

              {/* ================= PAGE 4: SPREAD 2 RIGHT (BAB I: MESIN TIK PERASAAN) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
                <div>
                  <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                    <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                      BAB I: MESIN TIK PERASAAN
                    </span>
                    <span className="font-typewriter text-[11px] text-[#9d174d]">DRAF TULUS</span>
                  </div>

                  {/* Typewriter Machine Box */}
                  <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-4 shadow-sm relative">
                    <div className="washi-tape w-20 h-4 -top-2 left-6 absolute" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-typewriter text-[10px] text-[#9d174d] font-bold uppercase tracking-wider">
                        KERTAS ARSIP NO. 14
                      </span>
                      <span className="text-[10px] font-typewriter text-[#be123c]">CATATAN PINK</span>
                    </div>

                    <div className="bg-white border border-[#fbcfe8] rounded-lg p-3 min-h-[95px] flex items-center shadow-inner">
                      <p className="font-typewriter text-xs text-[#3b1223] leading-relaxed">
                        {typedText}
                        <span className="inline-block w-1.5 h-3.5 bg-[#be123c] ml-1 animate-pulse" />
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={typeNextDraft}
                      disabled={isTyping}
                      className="mt-3 w-full py-1.5 px-3 rounded-lg bg-[#be123c] hover:bg-[#e11d48] text-white text-xs font-typewriter font-semibold shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Ketik Draf Berikutnya ⌨</span>
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 font-serif text-xs text-[#4c0519] leading-relaxed">
                    <p>
                      Setiap draf ini diketik pelan-pelan. Kadang dihapus lagi karena takut terlalu berlebihan, tapi akhirnya kubiarkan tertulis apa adanya.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>INTERAKTIF MESIN TIK</span>
                  <span>HAL. 03</span>
                </div>
              </div>

              {/* ================= PAGE 5: SPREAD 3 LEFT (BAB II: SASTRA WARUNG KUAH SAMBAL) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
                <div>
                  <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                    <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                      BAB II: SASTRA & KEHANGATAN
                    </span>
                    <span className="font-typewriter text-[11px] text-[#9d174d]">UNTUKMU 🍲</span>
                  </div>

                  {/* Sastra Centerpiece Box */}
                  <div className="bg-[#fff1f2] border-2 border-[#fbcfe8] rounded-2xl p-4 sm:p-5 shadow-sm relative">
                    <div className="washi-tape w-24 h-5 -top-2.5 left-8 absolute rotate-[-1deg]" />

                    <div className="flex items-center gap-1.5 text-xs text-[#be123c] font-serif italic mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#e11d48]" />
                      <span className="font-bold">Warung, Kuah, & Sambal</span>
                    </div>

                    {/* The Sastra Poem Requested by User */}
                    <div className="font-serif italic text-xs sm:text-[13px] text-[#3b1223] leading-relaxed border-l-2 border-[#be123c] pl-3.5 py-1 space-y-2">
                      <p>
                        &quot;kau terlalu hangat untuk dilewatkan<br />
                        sekali melihatmu, laparku berganti rupa<br />
                        ia tak lagi mencari kenyang<br />
                        ia belajar mengeja namamu
                      </p>
                      <p>
                        makan ajaklah aku ke warung langganan ku<br />
                        duduk berhadapan diantara kuah dan sambal<br />
                        biar uap yang mengepul menjadi saksi<br />
                        bahwa hati tak butuh dijelaskan.&quot;
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-dashed border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                      <span>DITULIS DENGAN HANGAT</span>
                      <span>🍲 SECANGKIR RASA</span>
                    </div>
                  </div>

                  <p className="mt-3 font-handwriting text-base sm:text-lg text-[#be123c] leading-snug">
                    &quot;Karena bersama kamu, hal sesederhana makan kuah hangat pun terasa seperti rumah.&quot;
                  </p>
                </div>

                <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>KUMPULAN SASTRA</span>
                  <span>HAL. 04</span>
                </div>
              </div>

              {/* ================= PAGE 6: SPREAD 3 RIGHT (BAB II: WISHLIST KENCAN) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
                <div>
                  <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                    <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                      BAB II: DAFTAR INGIN BARENG KAMU
                    </span>
                    <span className="font-typewriter text-[11px] text-[#9d174d]">WISHLIST</span>
                  </div>

                  {/* Interactive Checkbox List */}
                  <div className="bg-[#fff1f2] border border-[#fbcfe8] rounded-xl p-3.5 shadow-sm space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-serif text-[#4c0519]">
                      <input
                        type="checkbox"
                        checked={wishlistChecked[0]}
                        onChange={() => {
                          sound.playPencilSound();
                          const next = [...wishlistChecked];
                          next[0] = !next[0];
                          setWishlistChecked(next);
                        }}
                        className="mt-0.5 rounded accent-[#be123c]"
                      />
                      <span>Makan berdua di warung kuah & sambal langganan 🍲</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-serif text-[#4c0519]">
                      <input
                        type="checkbox"
                        checked={wishlistChecked[1]}
                        onChange={() => {
                          sound.playPencilSound();
                          const next = [...wishlistChecked];
                          next[1] = !next[1];
                          setWishlistChecked(next);
                        }}
                        className="mt-0.5 rounded accent-[#be123c]"
                      />
                      <span>Jalan sore santai sambil cerita hal random 👫🌸</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-serif text-[#4c0519]">
                      <input
                        type="checkbox"
                        checked={wishlistChecked[2]}
                        onChange={() => {
                          sound.playPencilSound();
                          const next = [...wishlistChecked];
                          next[2] = !next[2];
                          setWishlistChecked(next);
                        }}
                        className="mt-0.5 rounded accent-[#be123c]"
                      />
                      <span>Dengerin lagu kesukaan berdua pakai satu earphone 🎧</span>
                    </label>
                  </div>

                  {/* Activity Selector */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-typewriter text-[#9d174d] font-bold mb-1">
                      HAL PERTAMA YANG INGIN KITA LAKUKAN:
                    </label>
                    <select
                      value={coupleGoal}
                      onChange={(e) => {
                        sound.playPaperTurnSound();
                        setCoupleGoal(e.target.value);
                      }}
                      className="w-full text-xs font-serif bg-white border border-[#fbcfe8] rounded-lg p-2 text-[#3b1223] focus:outline-none focus:border-[#be123c]"
                    >
                      <option value="Makan di warung langganan hangat kuah & sambal 🍜💖">
                        Makan di warung langganan hangat kuah & sambal 🍜
                      </option>
                      <option value="Jalan berdua sambil gandengan tangan 👫💖">
                        Jalan berdua sambil gandengan tangan 👫
                      </option>
                      <option value="Ngopi santai berdua sambil dengar lagu ☕🎶">
                        Ngopi santai berdua sambil dengar lagu ☕
                      </option>
                      <option value="Nonton film favorit sambil ngemil bareng 🎬🍿">
                        Nonton film favorit sambil ngemil bareng 🎬
                      </option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>PILIHAN RENCANA KITA</span>
                  <span>HAL. 05</span>
                </div>
              </div>

              {/* ================= PAGE 7: SPREAD 4 LEFT (BAB III: WILL YOU BE MINE?) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-left h-full p-4 sm:p-6 flex flex-col justify-between page-scroll overflow-y-auto" data-density="soft">
                <div>
                  <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-2 mb-3">
                    <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#be123c] font-bold">
                      BAB III: DARI HATI YANG PALING DALAM
                    </span>
                    <span className="font-typewriter text-[11px] text-[#9d174d]">PERNYATAAN 💖</span>
                  </div>

                  {/* Confession Card */}
                  <div className="bg-[#fff1f2] border-2 border-[#fbcfe8] rounded-xl p-4 shadow-sm relative">
                    <div className="washi-tape w-20 h-4 -top-2 left-6 absolute" />
                    <div className="text-center mb-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fce7f3] text-[#be123c] font-bold tracking-widest font-cinzel">
                        WILL YOU BE MINE? 💖
                      </span>
                    </div>

                    <h3 className="font-serif text-sm font-bold text-[#3b1223] text-center mb-2">
                      Untuk <span className="text-[#be123c]">{state.recipient}</span> tercinta,
                    </h3>

                    <p className="font-handwriting text-base sm:text-lg text-[#be123c] text-center leading-relaxed">
                      &quot;Will you be mine? 💖 Dari sekian banyak orang di dunia, hatiku cuma memilih kamu. Maukah kamu jadi pacarku dan berjalan berdua mulai hari ini?&quot;
                    </p>

                    <p className="mt-2 text-xs font-serif italic text-center text-[#5c1d38]">
                      Di bawah naungan hangat merah jambu dan ditemani Snoopy, aku sungguh-sungguh ingin melangkah berdua bersamamu.
                    </p>
                  </div>

                  {/* Mood Selector */}
                  <div className="mt-3">
                    <label className="block text-[10px] font-typewriter text-[#9d174d] font-bold mb-1">
                      PERASAANMU PAS BACA BUKU INI:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-typewriter">
                      {['Senyum-senyum sendiri 😊', 'Deg-degan tapi bahagia 💓', 'Terharu banget 🥺'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            sound.playPaperTurnSound();
                            setSelectedMood(m);
                          }}
                          className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                            selectedMood === m
                              ? 'bg-[#be123c] text-white border-[#be123c] font-bold'
                              : 'bg-white text-[#3b1223] border-[#fbcfe8] hover:bg-[#fff1f2]'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Note */}
                  <div className="mt-3">
                    <label className="block text-[10px] font-typewriter text-[#9d174d] font-bold mb-1">
                      PESAN BALASAN MANISMU:
                    </label>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full text-xs font-serif bg-white border border-[#fbcfe8] rounded-lg p-2 text-[#3b1223] focus:outline-none focus:border-[#be123c]"
                      placeholder="Tulis pesan manismu..."
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>DEDIKASI TULUS</span>
                  <span>HAL. 06</span>
                </div>
              </div>

              {/* ================= PAGE 8: SPREAD 4 RIGHT (BAB III: JAWABAN KITA & WHATSAPP) ================= */}
              <div className="book-page-leaf paper-sheet page-arch-right h-full p-4 sm:p-6 flex flex-col justify-between relative page-scroll overflow-y-auto" data-density="soft">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-typewriter text-[#be123c] font-bold mb-2">
                    <span>LEMBAR JAWABAN KITA</span>
                    <span className="text-[#9d174d]">HAL. 07 / AKHIR BUKU</span>
                  </div>

                  {state.accepted ? (
                    /* RELATIONSHIP TICKET */
                    <div className="mb-3 p-3.5 rounded-xl border-2 border-[#be123c] bg-gradient-to-br from-[#fff1f2] to-[#fce7f3] text-center shadow-lg animate-fade-in">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#be123c] text-white flex items-center justify-center text-xl shadow-md animate-bounce">
                          💖
                        </div>
                        <div>
                          <p className="font-typewriter text-xs font-bold text-[#881337] tracking-widest uppercase">
                            RESMI BERPACARAN · BAB BARU DIMULAI
                          </p>
                          <p className="text-sm font-handwriting text-[#be123c] font-bold mt-0.5">
                            &quot;Mulai hari ini, kita melangkah bersama di bawah nuansa pink!&quot;
                          </p>
                        </div>

                        <div className="w-full pt-2 flex flex-col gap-2 mt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenWhatsApp();
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4 fill-white" />
                            <span>Kirim Jawaban ke WhatsApp 💬</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyCertificate}
                            className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-[#fff1f2] text-[#be123c] border border-[#fbcfe8] text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tersalin ke Clipboard!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin Surat Hubungan 📋</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* UNANSWERED STATE */
                    <div className="space-y-3">
                      <div className="p-3 bg-[#fff1f2] border border-[#fbcfe8] rounded-xl text-center">
                        <p className="text-xs font-serif text-[#4c0519] italic">
                          &quot;Jawabanmu adalah awal dari cerita indah kita berikutnya...&quot;
                        </p>
                        <p className="text-[11px] font-handwriting text-[#be123c] mt-1 font-bold">
                          {shyPrompt}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-1">
                        {/* YES BUTTON */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSayYes();
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#e11d48] via-[#be123c] to-[#e11d48] hover:opacity-95 text-white font-bold text-sm shadow-lg border border-[#fbcfe8] flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-white animate-pulse" />
                          <span>Iya, Aku Mau! 💖</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          {/* SHY BUTTON */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShy();
                            }}
                            className="py-2 px-3 rounded-lg bg-white hover:bg-[#fff1f2] text-[#be123c] border border-[#fbcfe8] text-xs font-semibold shadow-sm flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <span>Snoopy Malu 🙈</span>
                          </button>

                          {/* TIKTOK PM FALLBACK BUTTON */}
                          <button
                            type="button"
                            onClick={handleRejectTikTok}
                            className="py-2 px-3 rounded-lg bg-[#180610] hover:bg-[#2b0c1e] text-[#fbcfe8] border border-[#f472b6]/50 text-xs font-semibold shadow-sm flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Ngobrol santai lewat pesan TikTok"
                          >
                            <span>PM TikTok 💬</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 p-2 bg-[#fff1f2] border border-[#fbcfe8] rounded-lg text-[10px] font-typewriter text-[#9d174d] text-center">
                    <span>Direct WA: <strong>081221995470</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#fbcfe8] flex items-center justify-between text-[10px] font-typewriter text-[#9d174d]">
                  <span>CATATAN PINK RESMI</span>
                  <span>HAL. 07</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bookmark Drawer */}
      <BookmarkDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onJumpTo={(spreadIdx) => {
          setIsDrawerOpen(false);
          if (spreadIdx === 0) {
            handleCloseBook();
          } else {
            if (isCoverClosed) handleOpenBook();
            pageFlipRef.current?.turnToPage(spreadToPage(spreadIdx));
          }
        }}
        currentSpread={state.currentSpread}
      />

      {/* Vintage Polaroid Inspection Modal */}
      {selectedPolaroid && (
        <div
          onClick={() => setSelectedPolaroid(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-4 sm:p-5 rounded-2xl max-w-sm w-full border-2 border-[#fbcfe8] shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setSelectedPolaroid(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#be123c] text-white flex items-center justify-center shadow-lg hover:bg-[#e11d48] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative w-full h-64 sm:h-72 rounded-lg overflow-hidden border border-[#fbcfe8]">
              <Image
                src={selectedPolaroid.src}
                alt={selectedPolaroid.caption}
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3 text-center">
              <span className="text-[10px] font-typewriter text-[#be123c] font-bold uppercase tracking-wider block">
                {selectedPolaroid.chapter}
              </span>
              <p className="font-handwriting text-base text-[#3b1223] mt-1 leading-snug">
                {selectedPolaroid.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
});

FlipBook.displayName = 'FlipBook';
