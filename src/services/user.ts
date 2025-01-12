import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SavedMovie = Database['public']['Tables']['saved_movies']['Row'];

export async function saveMovie(movieData: {
  tmdb_id: number;
  title: string;
  poster_path: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('saved_movies')
    .insert([
      {
        user_id: user.id,
        ...movieData
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSavedMovies(): Promise<SavedMovie[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('saved_movies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function removeSavedMovie(tmdb_id: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from('saved_movies')
    .delete()
    .match({ user_id: user.id, tmdb_id });

  if (error) throw error;
}