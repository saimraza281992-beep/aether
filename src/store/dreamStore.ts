import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { playAmbient, stopAmbient } from '@/lib/audio';

export type Dream = {
  id: string;
  date: string;
  text: string;
  interpretation?: string;
  imageUrl?: string | null;
  audioUrl?: string;
  symbols: string[];
  emotions: string[];
  isSynced: boolean;
  parentId?: string; // For continuations
  resonanceCount?: number; // For likes/resonance
  location?: { lat: number; lng: number; name?: string };
  wakingQuest?: string;
  musePrompts?: string[];
  problemInsight?: string;
  user_id?: string;
};

interface DreamState {
  dreams: Dream[];
  globalDreams: Dream[];
  user: any | null;
  language: 'en' | 'ur';
  soundEnabled: boolean;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
  realityCheckEnabled: boolean;
  activeProblem: string;
  oracleSeed: string;
  
  loadDreams: () => Promise<void>;
  loadGlobalDreams: () => Promise<void>;
  addDream: (dream: Omit<Dream, 'id' | 'date' | 'isSynced'>) => Promise<void>;
  setUser: (user: any | null) => void;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
  setLanguage: (lang: 'en' | 'ur') => void;
  toggleSound: () => void;
  setLocationEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setRealityCheckEnabled: (enabled: boolean) => void;
  setActiveProblem: (problem: string) => void;
  setOracleSeed: (seed: string) => void;
  resonateWithDream: (id: string) => Promise<void>;
}

localforage.config({
  name: 'AETHER_Dreams',
  storeName: 'dreams'
});

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  globalDreams: [],
  user: null,
  language: 'en',
  soundEnabled: false,
  locationEnabled: false,
  notificationsEnabled: false,
  realityCheckEnabled: false,
  activeProblem: '',
  oracleSeed: '',
  
  setLanguage: (lang) => set({ language: lang }),
  
  toggleSound: () => {
    const { soundEnabled } = get();
    const newState = !soundEnabled;
    set({ soundEnabled: newState });
    if (newState) {
      playAmbient();
    } else {
      stopAmbient();
    }
  },

  setLocationEnabled: (enabled) => set({ locationEnabled: enabled }),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setRealityCheckEnabled: (enabled) => set({ realityCheckEnabled: enabled }),
  setActiveProblem: (problem) => set({ activeProblem: problem }),
  setOracleSeed: (seed) => set({ oracleSeed: seed }),

  setUser: (user) => set({ user }),
  
  checkUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null });
    
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null });
    });
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, dreams: [] });
  },

  loadDreams: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        set({ dreams: data });
        await localforage.setItem('dreams', data); // Cache locally
      } else {
        // Fallback to local if offline or no data
        const localDreams = await localforage.getItem<Dream[]>('dreams') || [];
        set({ dreams: localDreams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
      }
    } catch (err) {
      console.error("Error loading dreams from Supabase:", err);
      const localDreams = await localforage.getItem<Dream[]>('dreams') || [];
      set({ dreams: localDreams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) });
    }
  },

  loadGlobalDreams: async () => {
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .order('date', { ascending: false })
        .limit(150); // Limit for tapestry performance

      if (error) throw error;

      if (data) {
        set({ globalDreams: data });
      }
    } catch (err) {
      console.error("Error loading global dreams:", err);
      // If table doesn't exist or error, we just have empty tapestry or local dreams
      const localDreams = await localforage.getItem<Dream[]>('dreams') || [];
      set({ globalDreams: localDreams });
    }
  },
  
  addDream: async (dreamData) => {
    const { user } = get();
    const newDream: Dream = {
      ...dreamData,
      id: uuidv4(),
      date: new Date().toISOString(),
      isSynced: false,
      resonanceCount: 0,
      user_id: user?.id
    };
    
    // Save locally first for immediate UI update
    const currentDreams = await localforage.getItem<Dream[]>('dreams') || [];
    const updatedDreams = [newDream, ...currentDreams];
    await localforage.setItem('dreams', updatedDreams);
    set({ dreams: updatedDreams });

    // Sync to Supabase if user is logged in
    if (user) {
      try {
        const { error } = await supabase.from('dreams').insert([{
          id: newDream.id,
          user_id: user.id,
          date: newDream.date,
          text: newDream.text,
          interpretation: newDream.interpretation,
          image_url: newDream.imageUrl, // Map camelCase to snake_case if needed, but let's just use the object
          audio_url: newDream.audioUrl,
          symbols: newDream.symbols,
          emotions: newDream.emotions,
          parent_id: newDream.parentId,
          resonance_count: newDream.resonanceCount,
          location: newDream.location,
          waking_quest: newDream.wakingQuest,
          muse_prompts: newDream.musePrompts,
          problem_insight: newDream.problemInsight
        }]);

        if (!error) {
          // Mark as synced
          const syncedDreams = updatedDreams.map(d => d.id === newDream.id ? { ...d, isSynced: true } : d);
          await localforage.setItem('dreams', syncedDreams);
          set({ dreams: syncedDreams });
        } else {
          console.error("Error syncing dream to Supabase:", error);
        }
      } catch (err) {
        console.error("Error syncing dream to Supabase:", err);
      }
    }
  },

  resonateWithDream: async (id: string) => {
    // Optimistic UI update
    const { globalDreams, dreams } = get();
    
    const updateResonance = (list: Dream[]) => list.map(d => 
      d.id === id ? { ...d, resonanceCount: (d.resonanceCount || 0) + 1 } : d
    );

    set({ 
      globalDreams: updateResonance(globalDreams),
      dreams: updateResonance(dreams)
    });

    try {
      // In a real app, you'd call an RPC or update the row in Supabase
      // For now, we'll just try to increment it directly
      const dreamToUpdate = globalDreams.find(d => d.id === id) || dreams.find(d => d.id === id);
      if (dreamToUpdate) {
        await supabase
          .from('dreams')
          .update({ resonance_count: (dreamToUpdate.resonanceCount || 0) + 1 })
          .eq('id', id);
      }
    } catch (err) {
      console.error("Error updating resonance:", err);
    }
  }
}));
