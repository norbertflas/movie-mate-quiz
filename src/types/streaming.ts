
export interface StreamingService {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface StreamingPlatformData {
  available: boolean;
  startDate?: string;
  endDate?: string;
  link?: string;
  service: string;
  logo?: string;
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
