import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedStores, fetchAllStores } from '@/lib/api/stores';
import { getAllStores, getFeaturedStores } from '@/lib/services';
import { STALE_TIME_STATIC_MS } from '@/lib/query/client';
import { storeKeys } from '@/lib/query/keys';

export { storeKeys };

export function useFeaturedStores() {
  return useQuery({
    queryKey: storeKeys.featured(),
    queryFn: fetchFeaturedStores,
    staleTime: STALE_TIME_STATIC_MS,
    initialData: getFeaturedStores(),
  });
}

export function useAllStores() {
  return useQuery({
    queryKey: storeKeys.all,
    queryFn: fetchAllStores,
    staleTime: STALE_TIME_STATIC_MS,
    initialData: getAllStores(),
  });
}
