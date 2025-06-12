// client/src/stores/guestbook.store.ts
import { create } from 'zustand';
import type { GuestbookEntry } from '../data/guestbook.data';

// dinh nghia state va actions
interface GuestbookState {
  entries: GuestbookEntry[];
  isLoading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (name: string, message: string, lang: 'vi' | 'en' | 'ja') => Promise<void>;
}

// tao store
export const useGuestbookStore = create<GuestbookState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  // ham lay entries tu api
  fetchEntries: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/guestbook`);
      if (!res.ok) {
        let msg = `HTTP error! status: ${res.status}`;
        try { const errD = await res.json(); msg = errD.error || msg; } catch (e) {}
        throw new Error(msg);
      }
      const data = await res.json();
      set({ entries: data, isLoading: false });
    } catch (e: any) {
      console.error("Loi fetch GBook:", e);
      set({ error: e.message || 'Loi tai GBook.', isLoading: false });
    }
  },

  // ham them entry moi
  addEntry: async (name: string, message: string, lang: 'vi' | 'en' | 'ja') => {
    const payload = { name, message, language: lang };
    try {
      const res = await fetch(`/api/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = `Loi gui: ${res.status}`;
        try { const errD = await res.json(); msg = errD.error || msg; } catch (e) {}
        throw new Error(msg);
      }
      // fetch lai list de cap nhat
      get().fetchEntries();
    } catch (e: any) {
      console.error("Loi gui GBook tu store:", e);
      throw e; 
    }
  },
}));