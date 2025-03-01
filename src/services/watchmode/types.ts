/**
 * This file defines the types and interfaces for the Watchmode API responses and parameters.
 * It ensures type safety and consistency when interacting with the Watchmode API.
 */

export interface WatchmodeSource {
  source_id: number;
  name: string;
  type: string;
  region: string;
  ios_url?: string;
  android_url?: string;
  web_url?: string;
  format: string;
  price?: number;
  seasons?: number;
  episodes?: number;
}

export interface WatchmodeResponse {
  id: number;
  title: string;
  type: string;
  year: number;
  sources: WatchmodeSource[];
}

export interface WatchmodeSearchResult {
  id: number;
  name: string;
  type: string;
  year: number;
}

export interface WatchmodeTitleDetailsRequest {
  titleId: number;
  region?: string;
  includeSources?: boolean;
}

export interface WatchmodeSearchRequest {
  searchQuery: string;
  searchField?: string;
  types?: string;
  region?: string;
}
