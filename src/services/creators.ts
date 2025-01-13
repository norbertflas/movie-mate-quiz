import { supabase } from "@/integrations/supabase/client";

export interface Creator {
  id: string;
  name: string;
  role: string;
  tmdb_person_id: number;
  user_id: string;
}

export interface CreateCreatorInput {
  name: string;
  role: string;
  tmdb_person_id: number;
  user_id: string;
}

export const addFavoriteCreator = async (creator: CreateCreatorInput) => {
  const { data, error } = await supabase
    .from('favorite_creators')
    .insert([creator])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFavoriteCreator = async (creatorId: string) => {
  const { error } = await supabase
    .from('favorite_creators')
    .delete()
    .eq('id', creatorId);

  if (error) throw error;
};

export const getFavoriteCreators = async () => {
  const { data, error } = await supabase
    .from('favorite_creators')
    .select('*');

  if (error) throw error;
  return data;
};