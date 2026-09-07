import { supabase, SUPABASE_TABLES, isSupabaseConfigured } from '../lib/supabaseConfig';
import { Video } from '../types';
import { INITIAL_VIDEOS } from '../data/initialData';

export const videoService = {
  /**
   * Fetch all videos
   */
  async getVideos(): Promise<Video[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from(SUPABASE_TABLES.VIDEOS)
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as Video[];
        }
      } catch (err) {
        console.warn('[Supabase videos] Fetch error, using fallback:', err);
      }
    }
    return INITIAL_VIDEOS;
  },
};
