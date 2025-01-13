import { TMDB_IMAGE_BASE_URL } from "./config";

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder.svg';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
}