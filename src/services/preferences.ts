import { api, ApiError } from "@/lib/api-client";
import type { StreamingService } from "@/types/streaming";

interface ServiceRow {
  id: string;
  name: string;
  logoUrl: string | null;
}

export const getStreamingServices = async (): Promise<StreamingService[]> => {
  const rows = await api.get<ServiceRow[]>("/streaming-services");
  return rows.map((r) => ({ id: r.id, name: r.name, logo_url: r.logoUrl }));
};

export const getUserPreferences = async (): Promise<string[]> => {
  try {
    return await api.get<string[]>("/preferences");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return [];
    throw error;
  }
};

export const setUserPreferences = async (services: string[]): Promise<void> => {
  await api.put("/preferences", { services });
};
