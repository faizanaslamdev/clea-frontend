import { getFeaturedStores, getAllStores } from "@/lib/services";
import type { Store } from "@/lib/types";

export async function fetchFeaturedStores(): Promise<Store[]> {
  return getFeaturedStores();
}

export async function fetchAllStores(): Promise<Store[]> {
  return getAllStores();
}