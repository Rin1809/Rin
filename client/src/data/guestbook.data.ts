// client/src/data/guestbook.data.ts
export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string; 
  language: 'vi' | 'en' | 'ja';
}

export const initialGuestbookEntries: GuestbookEntry[] = [
  {
    id: '1',
    name: 'Một Nhà Lữ Hành Dễ Thương (Rin clone để test)',
    message: 'yêu rin vl.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    language: 'vi',
  },
  {
    id: '2',
    name: 'Curious Cat (Another Rin)',
    message: 'I love you so much, Rin !! Please marry me!!!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    language: 'en',
  },
  {
    id: '3',
    name: 'リンのファン (Still Rin)',
    message: '素敵なページですね！特にパーティクル効果が美しいです。これからも応援しています。💖',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    language: 'ja',
  },
];