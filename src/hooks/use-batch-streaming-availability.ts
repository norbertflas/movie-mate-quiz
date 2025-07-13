
import { useState, useCallback, useRef } from "react";
import { getStreamingAvailability } from "@/services/streamingAvailability";
import type { StreamingPlatformData } from "@/types/streaming";

interface BatchRequest {
  tmdbId: number;
  title?: string;
  year?: string;
  resolve: (data: StreamingPlatformData[]) => void;
  reject: (error: Error) => void;
}

interface BatchResult {
  [tmdbId: number]: StreamingPlatformData[];
}

// Global batch queue and timer
let batchQueue: BatchRequest[] = [];
let batchTimer: NodeJS.Timeout | null = null;
const BATCH_DELAY = 50; // 50ms delay to collect requests
const BATCH_SIZE = 5; // Process 5 movies at once

const processBatch = async () => {
  if (batchQueue.length === 0) return;
  
  const currentBatch = batchQueue.splice(0, BATCH_SIZE);
  
  try {
    // Process requests in parallel but with rate limiting
    const results = await Promise.allSettled(
      currentBatch.map(async (request) => {
        try {
          const data = await getStreamingAvailability(
            request.tmdbId,
            request.title,
            request.year
          );
          return { tmdbId: request.tmdbId, data };
        } catch (error) {
          throw { tmdbId: request.tmdbId, error };
        }
      })
    );

    // Resolve each request with its result
    results.forEach((result, index) => {
      const request = currentBatch[index];
      if (result.status === 'fulfilled') {
        request.resolve(result.value.data);
      } else {
        request.reject(new Error('Failed to fetch streaming data'));
      }
    });
  } catch (error) {
    // Reject all requests in case of batch failure
    currentBatch.forEach(request => {
      request.reject(error as Error);
    });
  }

  // Process next batch if queue is not empty
  if (batchQueue.length > 0) {
    batchTimer = setTimeout(processBatch, BATCH_DELAY);
  } else {
    batchTimer = null;
  }
};

export function useBatchStreamingAvailability() {
  const [cache, setCache] = useState<BatchResult>({});
  const requestsRef = useRef<Set<number>>(new Set());

  const fetchStreamingData = useCallback(async (
    tmdbId: number,
    title?: string,
    year?: string
  ): Promise<StreamingPlatformData[]> => {
    // Return cached data if available
    if (cache[tmdbId]) {
      return cache[tmdbId];
    }

    // Prevent duplicate requests
    if (requestsRef.current.has(tmdbId)) {
      return [];
    }

    requestsRef.current.add(tmdbId);

    return new Promise((resolve, reject) => {
      batchQueue.push({
        tmdbId,
        title,
        year,
        resolve: (data) => {
          setCache(prev => ({ ...prev, [tmdbId]: data }));
          requestsRef.current.delete(tmdbId);
          resolve(data);
        },
        reject: (error) => {
          requestsRef.current.delete(tmdbId);
          reject(error);
        }
      });

      // Start batch timer if not already running
      if (!batchTimer) {
        batchTimer = setTimeout(processBatch, BATCH_DELAY);
      }
    });
  }, [cache]);

  return { fetchStreamingData, cache };
}
