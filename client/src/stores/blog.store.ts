// client/src/stores/blog.store.ts
import { create } from 'zustand';

interface BlogPost {
  id: number;
  title: string;
  content?: string;
  image_url?: string;
  discord_author_id: string;
  timestamp: string;
}

interface BlogState {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/blog/posts`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      // sap xep ngay day
      const sortedData = data.sort((a: BlogPost, b: BlogPost) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ posts: sortedData, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || "Loi ko xac dinh khi tai bai viet.", isLoading: false });
    }
  },
}));