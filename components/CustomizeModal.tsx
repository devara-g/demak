'use client';

import React, { useState } from 'react';
import { BookState, defaultBookState } from '@/types';
import { X, Sparkles, RotateCcw, Phone } from 'lucide-react';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: BookState;
  onSave: (newState: Partial<BookState>) => void;
  onReset: () => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  state,
  onSave,
  onReset,
}) => {
  const [recipient, setRecipient] = useState(state.recipient);
  const [sender, setSender] = useState(state.sender);
  const [bookTitle, setBookTitle] = useState(state.bookTitle);
  const [dateBadge, setDateBadge] = useState(state.dateBadge);
  const [finalQuestion, setFinalQuestion] = useState(state.finalQuestion);
  const [whatsappNumber, setWhatsappNumber] = useState(state.whatsappNumber || defaultBookState.whatsappNumber);
  const [tiktokUsername, setTiktokUsername] = useState(state.tiktokUsername || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      recipient: recipient.trim() || defaultBookState.recipient,
      sender: sender.trim() || defaultBookState.sender,
      bookTitle: bookTitle.trim() || defaultBookState.bookTitle,
      dateBadge: dateBadge.trim() || defaultBookState.dateBadge,
      finalQuestion: finalQuestion.trim() || defaultBookState.finalQuestion,
      whatsappNumber: whatsappNumber.replace(/[^0-9]/g, '') || defaultBookState.whatsappNumber,
      tiktokUsername: tiktokUsername.trim().replace(/^@/, ''),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-[#fffafa] border-2 border-[#f43f5e] rounded-2xl max-w-lg w-full p-5 shadow-2xl text-[#351221] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#fbcfe8] pb-3 mb-4">
          <div>
            <span className="font-typewriter text-[10px] uppercase tracking-widest text-[#e11d48] font-bold">
              PERSONALISASI BUKU CONFESSION
            </span>
            <h3 className="font-serif text-lg font-bold text-[#4c162b]">Sesuaikan Nama & Isi Surat</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-[#fce7f3] hover:bg-[#fbcfe8] text-[#831843] font-bold flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold">
                Nama Dia (Penerima):
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
              />
            </div>
            <div>
              <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold">
                Nama Kamu (Pengirim):
              </label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold">
                Judul Sampul Buku:
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
              />
            </div>
            <div>
              <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold">
                Tanggal Arsip:
              </label>
              <input
                type="text"
                value={dateBadge}
                onChange={(e) => setDateBadge(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#e11d48]" />
                <span>Nomor WhatsApp (Saat Diterima):</span>
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Contoh: 081221995470"
                className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
              />
              <span className="text-[10px] text-[#9d174d] block mt-0.5">
                Otomatis diubah ke format 6281221995470
              </span>
            </div>
            <div>
              <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold flex items-center gap-1.5">
                <span className="text-sm">💬</span>
                <span>Username TikTok (PM jika ditolak):</span>
              </label>
              <input
                type="text"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                placeholder="Contoh: username_kamu (tanpa @)"
                className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
              />
              <span className="text-[10px] text-[#9d174d] block mt-0.5">
                Jika ditolak / ingin ngobrol di TikTok, langsung membuka link PM TikTok.
              </span>
            </div>
          </div>

          <div>
            <label className="font-typewriter text-[10px] uppercase text-[#831843] block mb-1 font-bold">
              Pesan Pengakuan Cinta di Bab III:
            </label>
            <textarea
              rows={3}
              value={finalQuestion}
              onChange={(e) => setFinalQuestion(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-[#fbcfe8] bg-white focus:outline-none focus:border-[#e11d48]"
            />
          </div>

          <div className="mt-5 pt-3 border-t border-[#fbcfe8] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg border border-[#fbcfe8] text-xs text-[#831843] hover:bg-[#fff1f2] flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Awal</span>
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#e11d48] hover:bg-[#f43f5e] text-white text-xs font-medium shadow flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Simpan Perubahan 💖</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
