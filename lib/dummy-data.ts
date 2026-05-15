import { Product, Store } from './types';

/** Local product photos (sourced from Unsplash, bundled for reliable demo loading) */
export const productImages = {
  tshirt: '/products/tshirt.jpg',
  serum: '/products/serum.jpg',
  backpack: '/products/backpack.jpg',
  jeans: '/products/jeans.jpg',
  lipTint: '/products/lip-tint.jpg',
  dress: '/products/dress.jpg',
  conditioner: '/products/conditioner.jpg',
  watch: '/products/watch.jpg',
  sweater: '/products/sweater.jpg',
  faceCream: '/products/face-cream.jpg',
  belt: '/products/belt.jpg',
  sneakers: '/products/sneakers.jpg',
  sunglasses: '/products/sunglasses.jpg',
  mascara: '/products/mascara.jpg',
} as const;

export const stores: Store[] = [
  { id: 'hm', name: 'H&M', country: 'Sweden', currency: 'SEK' },
  { id: 'zara', name: 'Zara', country: 'Spain', currency: 'EUR' },
  { id: 'boozt', name: 'Boozt', country: 'Sweden', currency: 'SEK' },
  { id: 'kicks', name: 'Kicks', country: 'Sweden', currency: 'SEK' },
  { id: 'ellos', name: 'Ellos', country: 'Sweden', currency: 'SEK' },
];

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Deterministic 30-day lowest-price trend per product (stable across reloads) */
const generatePriceHistory = (
  lowestPrice: number,
  productId: string
): Product['priceHistory'] => {
  const history: Product['priceHistory'] = [];
  const seedBase = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = lowestPrice * 0.12;
  const primaryStore = stores[seedBase % stores.length].id;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const trend = (29 - i) / 29;
    const noise = (seededRandom(seedBase + i * 31) - 0.5) * variation;
    const startPremium = variation * 0.8;

    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(lowestPrice + startPremium * (1 - trend) + noise),
      store: stores[(seedBase + i) % stores.length].id,
    });
  }

  history[history.length - 1].price = lowestPrice;
  history[history.length - 1].store = primaryStore;

  return history;
};

const computePriceStats = (prices: Record<string, number>, inStock: Record<string, boolean>) => {
  const available = Object.entries(prices).filter(([id]) => inStock[id]);
  const values = available.map(([, price]) => price);
  const lowest = Math.min(...values);
  const highest = Math.max(...values);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const savingsPercent = Math.round(((highest - lowest) / highest) * 100);

  return { lowestPrice: lowest, highestPrice: highest, averagePrice: average, savingsPercent };
};

export const products: Product[] = [
  (() => {
    const prices = { hm: 199, zara: 220, boozt: 189, kicks: 195, ellos: 199 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '1',
      name: 'Organic Cotton Crew Neck T-Shirt',
      brand: 'COS',
      category: 'Fashion' as const,
      image: productImages.tshirt,
      sku: 'COS-TEE-ORG-001',
      matchType: 'exact' as const,
      description:
        'Soft organic cotton crew neck in a relaxed fit. GOTS-certified fabric, available in neutral Nordic tones.',
      rating: 4.7,
      reviewCount: 324,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '1'),
      trending: true,
      trendingScore: 8.5,
    };
  })(),
  (() => {
    const prices = { hm: 549, zara: 599, boozt: 450, kicks: 529, ellos: 569 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '2',
      name: 'Nordic Glow Vitamin C Serum',
      brand: 'Lumene',
      category: 'Beauty' as const,
      image: productImages.serum,
      sku: 'LUM-VITC-30ML',
      matchType: 'exact' as const,
      description:
        'Brightening serum with Arctic cloudberry and vitamin C. 30 ml, dermatologist-tested for sensitive skin.',
      rating: 4.9,
      reviewCount: 587,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '2'),
      trending: true,
      trendingScore: 9.2,
    };
  })(),
  (() => {
    const prices = { hm: 399, zara: 449, boozt: 379, kicks: 429, ellos: 419 };
    const inStock = { hm: true, zara: false, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '3',
      name: 'Recycled Canvas Daypack',
      brand: 'Fjällräven',
      category: 'Accessories' as const,
      image: productImages.backpack,
      sku: 'FJL-KANKEN-REC',
      matchType: 'exact' as const,
      description:
        'Iconic daypack in recycled polyester with padded laptop sleeve (15"). Water-resistant base.',
      rating: 4.5,
      reviewCount: 156,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '3'),
      trending: false,
      trendingScore: 6.8,
    };
  })(),
  (() => {
    const prices = { hm: 799, zara: 899, boozt: 749, kicks: 829, ellos: 799 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '4',
      name: 'Slim Fit Stretch Denim Jeans',
      brand: 'Weekday',
      category: 'Fashion' as const,
      image: productImages.jeans,
      sku: 'WKD-DENIM-SLIM-32',
      matchType: 'exact' as const,
      description:
        'Mid-rise slim jeans with 2% elastane for comfort. Washes: Raw Indigo, Light Vintage, Black.',
      rating: 4.6,
      reviewCount: 412,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '4'),
      trending: true,
      trendingScore: 7.9,
    };
  })(),
  (() => {
    const prices = { hm: 149, zara: 169, boozt: 129, kicks: 159, ellos: 149 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '5',
      name: 'Hydrating Lip Oil Tint',
      brand: 'CAIA Cosmetics',
      category: 'Beauty' as const,
      image: productImages.lipTint,
      sku: 'CAIA-LIP-OIL-ROSE',
      matchType: 'exact' as const,
      description:
        'Vegan lip oil with sheer rose tint and jojoba. Buildable color, non-sticky finish.',
      rating: 4.8,
      reviewCount: 289,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '5'),
      trending: true,
      trendingScore: 8.7,
    };
  })(),
  (() => {
    const prices = { hm: 499, zara: 549, boozt: 459, kicks: 519, ellos: 489 };
    const inStock = { hm: false, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '6',
      name: 'Linen Midi Shirt Dress',
      brand: '& Other Stories',
      category: 'Fashion' as const,
      image: productImages.dress,
      sku: 'AOS-LINEN-MIDI-S',
      matchType: 'near' as const,
      description:
        'Breathable 100% linen midi dress with button front. Ideal for Scandinavian summers.',
      rating: 4.4,
      reviewCount: 198,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '6'),
      trending: false,
      trendingScore: 6.5,
    };
  })(),
  (() => {
    const prices = { hm: 249, zara: 279, boozt: 219, kicks: 259, ellos: 249 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '7',
      name: 'Repair & Shine Hair Mask',
      brand: 'Maria Nila',
      category: 'Beauty' as const,
      image: productImages.conditioner,
      sku: 'MN-MASK-250ML',
      matchType: 'exact' as const,
      description:
        'Vegan deep-conditioning mask with Colour Guard Complex. Sulfate- and paraben-free, 250 ml.',
      rating: 4.7,
      reviewCount: 421,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '7'),
      trending: false,
      trendingScore: 7.1,
    };
  })(),
  (() => {
    const prices = { hm: 1499, zara: 1599, boozt: 1399, kicks: 1499, ellos: 1549 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '8',
      name: 'Nordic Sport Smartwatch',
      brand: 'Polar',
      category: 'Accessories' as const,
      image: productImages.watch,
      sku: 'POL-IGNITE-3',
      matchType: 'exact' as const,
      description:
        'GPS smartwatch with sleep tracking, 100+ sport profiles, and 5 ATM water resistance.',
      rating: 4.6,
      reviewCount: 534,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '8'),
      trending: true,
      trendingScore: 8.3,
    };
  })(),
  (() => {
    const prices = { hm: 599, zara: 649, boozt: 579, kicks: 619, ellos: 599 };
    const inStock = { hm: true, zara: true, boozt: false, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '9',
      name: 'Merino Wool Crew Sweater',
      brand: 'Arket',
      category: 'Fashion' as const,
      image: productImages.sweater,
      sku: 'ARK-MERINO-CREW-M',
      matchType: 'exact' as const,
      description:
        'Fine merino wool sweater with ribbed cuffs. Naturally temperature-regulating for Nordic winters.',
      rating: 4.8,
      reviewCount: 367,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '9'),
      trending: true,
      trendingScore: 8.6,
    };
  })(),
  (() => {
    const prices = { hm: 699, zara: 749, boozt: 649, kicks: 719, ellos: 699 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '10',
      name: 'Arctic Hydration Day Cream SPF 30',
      brand: 'Estelle & Thild',
      category: 'Beauty' as const,
      image: productImages.faceCream,
      sku: 'ET-DAY-SPF30-50',
      matchType: 'exact' as const,
      description:
        'Certified organic day cream with broad-spectrum SPF 30. 50 ml, fragrance-free.',
      rating: 4.9,
      reviewCount: 623,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '10'),
      trending: true,
      trendingScore: 9.1,
    };
  })(),
  (() => {
    const prices = { hm: 299, zara: 349, boozt: 289, kicks: 319, ellos: 299 };
    const inStock = { hm: true, zara: false, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '11',
      name: 'Vegetable-Tanned Leather Belt',
      brand: 'Tiger of Sweden',
      category: 'Accessories' as const,
      image: productImages.belt,
      sku: 'TOS-BELT-32-BLK',
      matchType: 'exact' as const,
      description:
        'Full-grain leather belt with brushed steel buckle. Width 3.5 cm, sizes 80–110 cm.',
      rating: 4.5,
      reviewCount: 234,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '11'),
      trending: false,
      trendingScore: 6.2,
    };
  })(),
  (() => {
    const prices = { hm: 899, zara: 949, boozt: 849, kicks: 919, ellos: 899 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '12',
      name: 'Cloudfoam Running Sneakers',
      brand: 'Adidas',
      category: 'Fashion' as const,
      image: productImages.sneakers,
      sku: 'ADI-ULTRABOOST-22',
      matchType: 'exact' as const,
      description:
        'Lightweight running shoes with responsive cushioning and Continental rubber outsole.',
      rating: 4.7,
      reviewCount: 456,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '12'),
      trending: true,
      trendingScore: 8.2,
    };
  })(),
  (() => {
    const prices = { hm: 349, zara: 399, boozt: 329, kicks: 369, ellos: 359 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '13',
      name: 'Polarized Acetate Sunglasses',
      brand: 'Monokel Eyewear',
      category: 'Accessories' as const,
      image: productImages.sunglasses,
      sku: 'MON-SUN-POLAR-01',
      matchType: 'near' as const,
      description:
        'Handcrafted acetate frames with CR-39 polarized lenses. UV400 protection, unisex fit.',
      rating: 4.6,
      reviewCount: 178,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '13'),
      trending: true,
      trendingScore: 7.4,
    };
  })(),
  (() => {
    const prices = { hm: 179, zara: 199, boozt: 159, kicks: 189, ellos: 169 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '14',
      name: 'Volume Lift Waterproof Mascara',
      brand: 'Depend',
      category: 'Beauty' as const,
      image: productImages.mascara,
      sku: 'DEP-MASC-VOL-BLK',
      matchType: 'exact' as const,
      description:
        'Swedish bestseller mascara with curved brush for lift and length. Ophthalmologist tested.',
      rating: 4.5,
      reviewCount: 892,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '14'),
      trending: true,
      trendingScore: 8.9,
    };
  })(),
];
