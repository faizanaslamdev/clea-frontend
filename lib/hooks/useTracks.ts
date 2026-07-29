'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrack,
  getTrackByProduct,
  listTracks,
  stopTrack,
} from '@/lib/api/tracks';

export const trackQueryKeys = {
  all: ['tracks'] as const,
  list: () => [...trackQueryKeys.all, 'list'] as const,
  byProduct: (productId: string) =>
    [...trackQueryKeys.all, 'by-product', productId] as const,
};

export function useActiveTracks(enabled: boolean) {
  return useQuery({
    queryKey: trackQueryKeys.list(),
    queryFn: listTracks,
    enabled,
  });
}

export function useTrackByProduct(productId: string, enabled: boolean) {
  return useQuery({
    queryKey: trackQueryKeys.byProduct(productId),
    queryFn: () => getTrackByProduct(productId),
    enabled: enabled && Boolean(productId),
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => createTrack(productId),
    onSuccess: (track) => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all });
      if (track.productId) {
        void queryClient.invalidateQueries({
          queryKey: trackQueryKeys.byProduct(track.productId),
        });
      }
    },
  });
}

export function useStopTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trackId: string) => stopTrack(trackId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all });
    },
  });
}
