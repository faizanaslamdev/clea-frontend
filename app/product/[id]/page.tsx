import { redirect } from 'next/navigation';
import { getProductHref } from '@/lib/services';

interface LegacyProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyProductPage({ params }: LegacyProductPageProps) {
  const { id } = await params;
  redirect(getProductHref(id));
}
