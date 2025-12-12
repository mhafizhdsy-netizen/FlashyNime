
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Anime } from '../types';

export type Language = 'id' | 'en';

interface AppState {
  language: Language;
  watchlist: Anime[];
  history: Anime[]; // List of recently watched anime
  watchHistory: Record<string, string>; // animeId -> episodeId (for continue watching specific ep)
  
  setLanguage: (lang: Language) => void;
  addToWatchlist: (anime: Anime) => void;
  removeFromWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  
  // Updated to accept episode details for display in history card
  addToHistory: (anime: Anime, episodeTitle?: string) => void;
  removeFromHistory: (animeId: string) => void;
  clearHistory: () => void;
  
  updateHistory: (animeId: string, episodeId: string) => void;
  getLastWatched: (animeId: string) => string | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'id', // Default to Indonesian
      watchlist: [],
      history: [],
      watchHistory: {},
      
      setLanguage: (lang) => set({ language: lang }),

      addToWatchlist: (anime) => set((state) => ({ 
        watchlist: [...state.watchlist.filter(a => a.id !== anime.id), anime] 
      })),
      
      removeFromWatchlist: (id) => set((state) => ({ 
        watchlist: state.watchlist.filter((a) => a.id !== id) 
      })),
      
      isInWatchlist: (id) => get().watchlist.some((a) => a.id === id),
      
      addToHistory: (anime, episodeTitle) => set((state) => {
        // Remove if exists to push to top
        const filtered = state.history.filter(a => a.id !== anime.id);
        
        // Create updated anime object with current episode info for the card
        const updatedAnime = { 
          ...anime, 
          // If episodeTitle provided (e.g. "Episode 5"), update the 'episode' field for the UI
          episode: episodeTitle ? episodeTitle.replace(/Episode\s+/i, '') : anime.episode,
          last_update: new Date().toISOString() // Track when it was watched
        };

        return { history: [updatedAnime, ...filtered].slice(0, 50) }; // Limit to 50 items
      }),

      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter(a => a.id !== id)
      })),

      clearHistory: () => set({ history: [] }),

      updateHistory: (animeId, episodeId) => set((state) => ({
        watchHistory: { ...state.watchHistory, [animeId]: episodeId }
      })),
      
      getLastWatched: (animeId) => get().watchHistory[animeId],
    }),
    {
      name: 'flashynime-storage',
    }
  )
);
