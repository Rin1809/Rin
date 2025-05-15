// client/src/data/guestbook.data.ts
export interface GuestbookEntry {
  id: string | number; // ID từ DB là number (SERIAL) hoặc string nếu dùng UUID sau này
  name: string;
  message: string;
  timestamp: string; 
  language: 'vi' | 'en' | 'ja';
}

