/** Company details for legal and contact pages */
export const COMPANY = {
  name: 'Clea',
  email: 'hei@clea.no',
  address: {
    line1: 'Kildalvegen 8',
    city: 'Gjøvik',
    postalCode: '2818',
    country: 'Norway',
  },
  locationLabel: 'Oslo, Norway',
  about:
    'Clea is a Nordic AI-powered fashion price comparison platform based in Oslo, Norway. We help shoppers find the best prices across leading retailers such as Zalando, Boozt, Nelly, and H&M through conversational AI search. Our users arrive with high purchase intent — ready to buy — and we connect them directly to retailer product pages.',
  market:
    'Our primary market is Norway, with expansion planned across the Nordics.',
} as const;

export function formatCompanyAddress(): string {
  const { line1, postalCode, city, country } = COMPANY.address;
  return `${line1}, ${postalCode} ${city}, ${country}`;
}
