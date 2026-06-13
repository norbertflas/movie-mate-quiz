import { api, ApiError } from "@/lib/api-client";

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
  user_id?: string;
}

interface CreatorRow {
  id: string;
  name: string;
  role: string;
  tmdbPersonId: number;
  userId: string;
}

const mapCreator = (r: CreatorRow): Creator => ({
  id: r.id,
  name: r.name,
  role: r.role,
  tmdb_person_id: r.tmdbPersonId,
  user_id: r.userId,
});

export const addFavoriteCreator = async (creator: CreateCreatorInput): Promise<void> => {
  await api.post("/creators", {
    name: creator.name,
    role: creator.role,
    tmdbPersonId: creator.tmdb_person_id,
  });
};

export const removeFavoriteCreator = async (creatorId: string): Promise<void> => {
  await api.delete(`/creators/${creatorId}`);
};

export const getFavoriteCreators = async (): Promise<Creator[]> => {
  try {
    const rows = await api.get<CreatorRow[]>("/creators");
    return rows.map(mapCreator);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return [];
    throw error;
  }
};
