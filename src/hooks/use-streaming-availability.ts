
import { useQuery } from "@tanstack/react-query";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

export const useStreamingAvailability = (tmdbId: number | undefined, title?: string, year?: string) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['streamingAvailability', tmdbId, title, year],
    queryFn: () => getStreamingAvailability(tmdbId!, title, year),
    enabled: !!tmdbId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 429) {
        const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
        const retryAfter = errorBody?.retryAfter || 60;
        toast({
          title: t("errors.rateLimitExceeded"),
          description: t("errors.tryAgainIn", { seconds: retryAfter }),
          variant: "destructive",
        });
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex, error: any) => {
      if (error?.status === 429) {
        const errorBody = typeof error.body === 'string' ? JSON.parse(error.body) : error.body;
        const retryAfter = errorBody?.retryAfter || 60;
        return retryAfter * 1000; // Convert seconds to milliseconds
      }
      return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
    }
  });
};
