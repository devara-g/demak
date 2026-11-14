export interface BookState {
  recipient: string;
  sender: string;
  bookTitle: string;
  dateBadge: string;
  finalQuestion: string;
  whatsappNumber: string;
  tiktokUsername: string;
  currentSpread: number;
  selectedMood: string;
  accepted: boolean;
}

export const defaultBookState: BookState = {
  recipient: 'Seseorang Spesial',
  sender: 'Aku yang Mengagumimu',
  bookTitle: 'Tentang Kamu & Nuansa Pink',
  dateBadge: '11.11.2026',
  finalQuestion: 'Will you be mine? 💖 Dari sekian banyak orang di dunia, hatiku cuma memilih kamu. Maukah kamu jadi pacarku dan berjalan berdua mulai hari ini?',
  whatsappNumber: '6281221995470',
  tiktokUsername: '',
  currentSpread: 0,
  selectedMood: 'Senyum-senyum sendiri 😊',
  accepted: false,
};
