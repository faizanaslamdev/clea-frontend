'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrack,
  getTrackByProduct,
  listTracks,
  stopTrack,
  type TrackRecord,
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
    onMutate: async (trackId) => {
      await queryClient.cancelQueries({ queryKey: trackQueryKeys.all });
      const previousTracks = queryClient.getQueryData<TrackRecord[]>(
        trackQueryKeys.list(),
      );
      const removedTrack = previousTracks?.find((track) => track.id === trackId);

      if (previousTracks) {
        queryClient.setQueryData<TrackRecord[]>(
          trackQueryKeys.list(),
          previousTracks.filter((track) => track.id !== trackId),
        );
      }

      const productId = removedTrack?.productId ?? removedTrack?.product?.id;
      const previousProductState = productId
        ? queryClient.getQueryData(trackQueryKeys.byProduct(productId))
        : undefined;

      if (productId) {
        queryClient.setQueryData(trackQueryKeys.byProduct(productId), {
          tracking: false,
          track: null,
        });
      }

      return { previousTracks, previousProductState, productId };
    },
    onError: (_error, _trackId, context) => {
      if (context?.previousTracks) {
        queryClient.setQueryData(
          trackQueryKeys.list(),
          context.previousTracks,
        );
      }
      if (context?.productId && context.previousProductState) {
        queryClient.setQueryData(
          trackQueryKeys.byProduct(context.productId),
          context.previousProductState,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: trackQueryKeys.all });
    },
  });
}
