import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface MovieList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export interface CreateMovieListInput {
  name: string;
  description?: string;
  is_public?: boolean;
}

export const createMovieList = async (input: CreateMovieListInput) => {
  const { data, error } = await supabase
    .from('movie_lists')
    .insert({
      name: input.name,
      description: input.description,
      is_public: input.is_public ?? false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMovieLists = async () => {
  const { data, error } = await supabase
    .from('movie_lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const addMovieToList = async (listId: string, movieId: number, title: string) => {
  const { error } = await supabase
    .from('movie_list_items')
    .insert({
      list_id: listId,
      tmdb_id: movieId,
      title: title,
    });

  if (error) throw error;
};

export const removeMovieFromList = async (listId: string, movieId: number) => {
  const { error } = await supabase
    .from('movie_list_items')
    .delete()
    .match({ list_id: listId, tmdb_id: movieId });

  if (error) throw error;
};