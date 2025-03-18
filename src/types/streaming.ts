
export interface StreamingService {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface StreamingPlatformData {
  service: string;
  available: boolean;
  startDate?: string;
  endDate?: string;
  link: string;
  logo?: string;
  type?: string; // Added new type field
}

export interface StreamingAvailabilityCache {
  data: StreamingPlatformData[];
  timestamp: number;
}

export interface StreamingAvailabilityData {
  services: StreamingPlatformData[];
  timestamp: string;
  isStale: boolean;
}
