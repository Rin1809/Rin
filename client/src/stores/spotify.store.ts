// client/src/stores/spotify.store.ts
import { create } from 'zustand';

interface SpotifyPlaylist {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    externalUrl: string;
    owner: string;
}

interface SpotifyState {
  playlists: SpotifyPlaylist[];
  isLoading: boolean;
  error: string | null;
  fetchPlaylists: () => Promise<void>;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  playlists: [],
  isLoading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/spotify/playlists`);
      if (!res.ok) {
        let msg = `HTTP error! status: ${res.status}`;
        try { const errData = await res.json(); msg = errData.error || msg; } catch (e) {}
        throw new Error(msg);
      }
      const data = await res.json();
      set({ playlists: data, isLoading: false });
    } catch (e: any) {
      console.error("Loi fetch Spotify Playlists:", e);
      set({ error: e.message || 'Loi tai Spotify playlists.', isLoading: false });
    }
  },
}));