import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SavedMovie = Database["public"]["Tables"]["saved_movies"]["Row"];

export const getSavedMovies = async (): Promise<SavedMovie[]> => {
  const { data, error } = await supabase
    .from("saved_movies")
    .select("*");

  if (error) throw error;
  return data || [];
};

export const saveMovies = async (movies: { tmdb_id: number; title: string; poster_path: string }[]) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not authenticated");

  const moviesToSave = movies.map(movie => ({
    ...movie,
    user_id: user.id,
  }));

  const { error } = await supabase
    .from("saved_movies")
    .insert(moviesToSave);

  if (error) throw error;
};

export const removeSavedMovie = async (tmdb_id: number) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("saved_movies")
    .delete()
    .eq("tmdb_id", tmdb_id)
    .eq("user_id", user.id);

  if (error) throw error;
};

export const isSavedMovie = async (tmdb_id: number): Promise<boolean> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from("saved_movies")
    .select("id")
    .eq("tmdb_id", tmdb_id)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
};