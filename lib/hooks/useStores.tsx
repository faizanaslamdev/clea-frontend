import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedStores, fetchAllStores } from "@/lib/api/stores";

export const storeKeys = {
  all: ["stores"] as const,
  featured: () => [...storeKeys.all, "featured"] as const,
};

export function useFeaturedStores() {
  return useQuery({
    queryKey: storeKeys.featured(),
    queryFn: fetchFeaturedStores,
    staleTime: Infinity, // dummy data never changes
  });
}

export function useAllStores() {
  return useQuery({
    queryKey: storeKeys.all,
    queryFn: fetchAllStores,
    staleTime: Infinity,
  });
}