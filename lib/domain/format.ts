export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatPrice(price: number, currency = 'NOK'): string {
  return price.toLocaleString('nb-NO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });
}
