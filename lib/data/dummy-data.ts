import type { Product, Store } from '@/lib/types';

/** Local product photos in /public/products (user-provided + bundled assets) */
export const productImages = {
  tshirt: '/products/tshirt.jpg',
  serum: '/products/serum.jpg',
  girlsJeans: '/products/girls-jeans.jpg',
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
  scarf: '/products/scarf.jpg',
  bodyLotion: '/products/body-lotion.jpg',
  crossbody: '/products/crossbody.jpg',
  beanie: '/products/beanie.jpg',
  palette: '/products/palette.jpg',
  bottle: '/products/bottle.jpg',
  blazer: '/products/blazer.jpg',
  cleanser: '/products/cleanser.jpg',
  earrings: '/products/earrings.jpg',
  boots: '/products/boots.jpg',
  handbag: '/products/handbag.jpg',
  linenDressWhite: '/products/linen-dress-white.jpg',
  sheerTop: '/products/sheer-top.jpg',
  graphicTee: '/products/graphic-tee.jpg',
  miniSkirt: '/products/mini-skirt.jpg',
  sequinTop: '/products/sequin-top.jpg',
  poplinDress: '/products/dress.jpg',
  bikini: '/products/bikini.jpg',
  shortShorts: '/products/short-shorts.jpg',
  ribbedCropTop: '/products/ribbed-crop-top.jpg',
  linenShorts: '/products/linen-shorts.jpg',
  bikiniSet: '/products/bikini-set.jpg',
  terryShorts: '/products/terry-shorts.jpg',
  ruffleTop: '/products/ruffle-top.jpg',
  summerRomper: '/products/summer-romper.jpg',
} as const;

export const stores: Store[] = [
  {
    id: 'hm',
    size: 'sm',
    name: 'DIOR',
    country: 'France',
    currency: 'EUR',
    coverImage: productImages.linenDressWhite,
    logo: '/logos/dior.png',
  },
  {
    id: 'zara',
    size: 'lg',
    name: 'MANGO',
    country: 'Spain',
    currency: 'EUR',
    coverImage: productImages.linenShorts,
    logo: '/logos/mango.png',
  },
  {
    id: 'boozt',
    size: 'md',
    name: 'Madewell',
    country: 'United States',
    currency: 'USD',
    coverImage: productImages.sequinTop,
    logo: '/logos/madewell.png',
  },
  {
    id: 'kicks',
    size: 'lg',
    name: 'DÔEN',
    country: 'United States',
    currency: 'USD',
    coverImage: productImages.summerRomper,
    logo: '/logos/doen.png',
  },
  {
    id: 'ellos',
    size: 'md',
    name: 'POSSE',
    country: 'Australia',
    currency: 'AUD',
    coverImage: productImages.handbag,
    logo: '/logos/posse.png',
  },
  {
    id: 'monki',
    size: 'sm',
    name: 'GUIZIO',
    country: 'United States',
    currency: 'USD',
    coverImage: productImages.earrings,
    logo: '/logos/guizio.png',
  },
  {
    id: 'weekday',
    size: 'md',
    name: 'Djerf Avenue',
    country: 'Australia',
    currency: 'AUD',
    coverImage: productImages.palette,
    logo: '/logos/djerf-avenue.png',
  },
  {
    id: 'arket',
    size: 'sm',
    name: 'seezona',
    country: 'United Kingdom',
    currency: 'GBP',
    coverImage: productImages.ribbedCropTop,
    logo: '/logos/seezona.png',
  },
  {
    id: 'fjallraven',
    size: 'lg',
    name: 'Dagne Dover',
    country: 'United States',
    currency: 'USD',
    coverImage: productImages.graphicTee,
    logo: '/logos/dagne-dover.png',
  },
  {
    id: 'belk',
    size: 'md',
    name: 'Belk',
    country: 'United States',
    currency: 'USD',
    coverImage: productImages.blazer,
    logo: '/logos/belk.png',
  },
  {
    id: 'wrangler',
    size: 'sm',
    name: 'Wrangler',
    country: 'United States',
    currency: 'USD',
    coverImage: productImages.jeans,
    logo: '/logos/wrangler.png',
  },
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
    const prices = { hm: 449, zara: 499, boozt: 399, kicks: 469, ellos: 429 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '2',
      name: 'High-Rise Wide Leg Jeans',
      brand: 'Weekday',
      category: 'Fashion' as const,
      image: productImages.girlsJeans,
      sku: 'WKD-WIDE-JEANS-28',
      matchType: 'exact' as const,
      description:
        'Relaxed wide-leg jeans with a flattering high rise and soft stretch denim. Light vintage wash, perfect for everyday Nordic style.',
      rating: 4.7,
      reviewCount: 624,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '2'),
      trending: true,
      trendingScore: 9.1,
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
  (() => {
    const prices = { hm: 299, zara: 349, boozt: 279, kicks: 319, ellos: 289 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '15',
      name: 'Merino Wool Scarf',
      brand: 'Arket',
      category: 'Fashion' as const,
      image: productImages.scarf,
      sku: 'ARK-SCARF-MERINO',
      matchType: 'exact' as const,
      description: 'Soft merino wool scarf with fringed ends. Lightweight warmth for Nordic winters.',
      rating: 4.6,
      reviewCount: 241,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '15'),
      trending: true,
      trendingScore: 7.6,
    };
  })(),
  (() => {
    const prices = { hm: 189, zara: 209, boozt: 169, kicks: 199, ellos: 179 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '16',
      name: 'Hydrating Body Lotion',
      brand: 'Nivea Nordic',
      category: 'Beauty' as const,
      image: productImages.bodyLotion,
      sku: 'NIV-BODY-400ML',
      matchType: 'exact' as const,
      description: '24h moisture body lotion with almond oil. Fast-absorbing, fragrance-light formula.',
      rating: 4.5,
      reviewCount: 1204,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '16'),
      trending: false,
      trendingScore: 6.9,
    };
  })(),
  (() => {
    const prices = { hm: 599, zara: 649, boozt: 549, kicks: 619, ellos: 579 };
    const inStock = { hm: true, zara: false, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '17',
      name: 'Leather Crossbody Bag',
      brand: 'Tiger of Sweden',
      category: 'Accessories' as const,
      image: productImages.crossbody,
      sku: 'TOS-CROSS-BLK',
      matchType: 'exact' as const,
      description: 'Compact crossbody in pebbled leather with adjustable strap and interior card slots.',
      rating: 4.7,
      reviewCount: 188,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '17'),
      trending: true,
      trendingScore: 8.0,
    };
  })(),
  (() => {
    const prices = { hm: 249, zara: 279, boozt: 229, kicks: 259, ellos: 239 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '18',
      name: 'Ribbed Wool Beanie',
      brand: 'Acne Studios',
      category: 'Fashion' as const,
      image: productImages.beanie,
      sku: 'ACNE-BEANIE-RIB',
      matchType: 'exact' as const,
      description: 'Classic rib-knit beanie in responsibly sourced wool. Unisex fit.',
      rating: 4.8,
      reviewCount: 312,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '18'),
      trending: true,
      trendingScore: 8.4,
    };
  })(),
  (() => {
    const prices = { hm: 329, zara: 379, boozt: 299, kicks: 349, ellos: 319 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '19',
      name: 'Neutral Eyeshadow Palette',
      brand: 'Make Up Store',
      category: 'Beauty' as const,
      image: productImages.palette,
      sku: 'MUS-PALETTE-NORD',
      matchType: 'exact' as const,
      description: '12 matte and shimmer shades inspired by Scandinavian light. Cruelty-free.',
      rating: 4.6,
      reviewCount: 267,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '19'),
      trending: true,
      trendingScore: 7.8,
    };
  })(),
  (() => {
    const prices = { hm: 199, zara: 229, boozt: 179, kicks: 209, ellos: 189 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '20',
      name: 'Insulated Steel Water Bottle',
      brand: 'Hydro Flask',
      category: 'Accessories' as const,
      image: productImages.bottle,
      sku: 'HF-BOTTLE-500',
      matchType: 'exact' as const,
      description: 'Double-wall vacuum bottle keeps drinks cold 24h or hot 12h. 500 ml, BPA-free.',
      rating: 4.7,
      reviewCount: 445,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '20'),
      trending: false,
      trendingScore: 7.0,
    };
  })(),
  (() => {
    const prices = { hm: 1299, zara: 1399, boozt: 1199, kicks: 1349, ellos: 1249 };
    const inStock = { hm: true, zara: true, boozt: false, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '21',
      name: 'Tailored Wool Blazer',
      brand: 'Filippa K',
      category: 'Fashion' as const,
      image: productImages.blazer,
      sku: 'FK-BLAZER-WOOL-38',
      matchType: 'near' as const,
      description: 'Single-breasted blazer in Italian wool blend. Minimal silhouette, fully lined.',
      rating: 4.8,
      reviewCount: 156,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '21'),
      trending: true,
      trendingScore: 8.1,
    };
  })(),
  (() => {
    const prices = { hm: 219, zara: 249, boozt: 199, kicks: 229, ellos: 209 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '22',
      name: 'Gentle Foaming Cleanser',
      brand: 'Verso Skincare',
      category: 'Beauty' as const,
      image: productImages.cleanser,
      sku: 'VER-CLEAN-150ML',
      matchType: 'exact' as const,
      description: 'pH-balanced cleanser with niacinamide. Removes makeup without stripping skin.',
      rating: 4.7,
      reviewCount: 378,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '22'),
      trending: false,
      trendingScore: 7.3,
    };
  })(),
  (() => {
    const prices = { hm: 449, zara: 499, boozt: 419, kicks: 469, ellos: 439 };
    const inStock = { hm: false, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '23',
      name: '14K Gold Hoop Earrings',
      brand: 'All Blues',
      category: 'Accessories' as const,
      image: productImages.earrings,
      sku: 'AB-HOOP-14K-S',
      matchType: 'exact' as const,
      description: 'Hand-finished gold hoops with click closure. Hypoallergenic, 18 mm diameter.',
      rating: 4.9,
      reviewCount: 94,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '23'),
      trending: true,
      trendingScore: 8.8,
    };
  })(),
  (() => {
    const prices = { hm: 1099, zara: 1149, boozt: 999, kicks: 1079, ellos: 1049 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '24',
      name: 'Chelsea Ankle Boots',
      brand: 'Vagabond',
      category: 'Fashion' as const,
      image: productImages.boots,
      sku: 'VAG-CHELSEA-37',
      matchType: 'exact' as const,
      description: 'Classic Chelsea boots in polished leather with elastic side panels and durable sole.',
      rating: 4.6,
      reviewCount: 521,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '24'),
      trending: true,
      trendingScore: 8.5,
    };
  })(),
  (() => {
    const prices = { hm: 799, zara: 849, boozt: 749, kicks: 819, ellos: 769 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '25',
      name: 'Structured Leather Handbag',
      brand: 'Totême',
      category: 'Accessories' as const,
      image: productImages.handbag,
      sku: 'TOT-HANDBAG-LEA',
      matchType: 'near' as const,
      description: 'Minimal top-handle bag in smooth calf leather with magnetic closure and suede lining.',
      rating: 4.8,
      reviewCount: 143,
      prices,
      inStock,
      ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '25'),
      trending: true,
      trendingScore: 9.0,
    };
  })(),
  (() => {
    const prices = { hm: 248, zara: 268, boozt: 228, kicks: 258, ellos: 238 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '26',
      name: 'Leila Linen Midi Dress',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.linenDressWhite,
      sku: 'GUZ-LEILA-MIDI-WHT',
      matchType: 'exact' as const,
      description: 'Sleeveless linen midi dress with clean Scandinavian lines. Perfect for summer events.',
      rating: 4.8,
      reviewCount: 412,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '26'),
      trending: true,
      trendingScore: 9.3,
    };
  })(),
  (() => {
    const prices = { hm: 178, zara: 198, boozt: 168, kicks: 188, ellos: 172 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '27',
      name: 'Ara Sheer Long-Sleeve Top',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.sheerTop,
      sku: 'GUZ-ARA-TOP-RED',
      matchType: 'exact' as const,
      description: 'Sheer mesh top with sculpted fit. Layer over a camisole for elevated evening looks.',
      rating: 4.6,
      reviewCount: 289,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '27'),
      trending: true,
      trendingScore: 8.8,
    };
  })(),
  (() => {
    const prices = { hm: 68, zara: 78, boozt: 62, kicks: 72, ellos: 65 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '28',
      name: 'Nordic Loves Me Graphic Tee',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.graphicTee,
      sku: 'GUZ-TEE-NLM-WHT',
      matchType: 'exact' as const,
      description: 'Organic cotton tee with minimalist Nordic graphic. Relaxed unisex fit.',
      rating: 4.5,
      reviewCount: 678,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '28'),
      trending: true,
      trendingScore: 8.2,
    };
  })(),
  (() => {
    const prices = { hm: 108, zara: 128, boozt: 98, kicks: 118, ellos: 105 };
    const inStock = { hm: true, zara: false, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '29',
      name: 'Paloma Mini Skirt',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.miniSkirt,
      sku: 'GUZ-PALOMA-MINI',
      matchType: 'exact' as const,
      description: 'High-waisted mini skirt in structured weave. Pairs with the Ara top for a full look.',
      rating: 4.7,
      reviewCount: 334,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '29'),
      trending: true,
      trendingScore: 8.6,
    };
  })(),
  (() => {
    const prices = { hm: 142, zara: 159, boozt: 129, kicks: 149, ellos: 135 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '30',
      name: 'Paradise Sequin Halter Top',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.sequinTop,
      sku: 'GUZ-PARADISE-SEQ',
      matchType: 'exact' as const,
      description: 'Iridescent sequin halter with open back. Statement piece for evening wear.',
      rating: 4.8,
      reviewCount: 201,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '30'),
      trending: true,
      trendingScore: 9.0,
    };
  })(),
  (() => {
    const prices = { hm: 228, zara: 248, boozt: 208, kicks: 238, ellos: 218 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '31',
      name: 'Leila Cotton Poplin Dress',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.poplinDress,
      sku: 'GUZ-LEILA-POP-WHT',
      matchType: 'exact' as const,
      description: 'Crisp cotton poplin shirt dress with waist tie. Effortless day-to-night styling.',
      rating: 4.7,
      reviewCount: 356,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '31'),
      trending: true,
      trendingScore: 8.9,
    };
  })(),
  (() => {
    const prices = { hm: 198, zara: 218, boozt: 178, kicks: 208, ellos: 188 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '32',
      name: 'Riviera String Bikini',
      brand: 'Weekday',
      category: 'Fashion' as const,
      image: productImages.bikini,
      sku: 'WKD-RIVIERA-BIK',
      matchType: 'exact' as const,
      description: 'Minimal string bikini in soft ribbed fabric. Adjustable ties and lined cups.',
      rating: 4.6,
      reviewCount: 892,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '32'),
      trending: true,
      trendingScore: 9.4,
    };
  })(),
  (() => {
    const prices = { hm: 88, zara: 98, boozt: 78, kicks: 92, ellos: 85 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '33',
      name: 'High-Waist Denim Shorts',
      brand: 'Ganni',
      category: 'Fashion' as const,
      image: productImages.shortShorts,
      sku: 'GAN-DENIM-SHORT',
      matchType: 'exact' as const,
      description: 'Vintage-wash denim shorts with a flattering high waist and raw hem.',
      rating: 4.7,
      reviewCount: 567,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '33'),
      trending: true,
      trendingScore: 8.7,
    };
  })(),
  (() => {
    const prices = { hm: 58, zara: 68, boozt: 52, kicks: 62, ellos: 55 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '34',
      name: 'Ribbed Crop Tank',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.ribbedCropTop,
      sku: 'GUZ-RIB-CROP',
      matchType: 'exact' as const,
      description: 'Soft ribbed crop tank in candy pink. Pairs with denim shorts or linen trousers.',
      rating: 4.5,
      reviewCount: 423,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '34'),
      trending: true,
      trendingScore: 8.4,
    };
  })(),
  (() => {
    const prices = { hm: 118, zara: 138, boozt: 108, kicks: 128, ellos: 112 };
    const inStock = { hm: true, zara: false, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '35',
      name: 'Linen Paperbag Shorts',
      brand: '& Other Stories',
      category: 'Fashion' as const,
      image: productImages.linenShorts,
      sku: 'AOS-LINEN-SHORT',
      matchType: 'exact' as const,
      description: 'Breathable linen shorts with paperbag waist and tie belt. Easy summer staple.',
      rating: 4.6,
      reviewCount: 298,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '35'),
      trending: false,
      trendingScore: 7.5,
    };
  })(),
  (() => {
    const prices = { hm: 228, zara: 248, boozt: 208, kicks: 238, ellos: 218 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: false };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '36',
      name: 'Cherry Print Bikini Set',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.bikiniSet,
      sku: 'GUZ-CHERRY-BIK',
      matchType: 'exact' as const,
      description: 'Playful cherry-print bikini with balconette top and mid-rise bottoms.',
      rating: 4.8,
      reviewCount: 512,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '36'),
      trending: true,
      trendingScore: 9.1,
    };
  })(),
  (() => {
    const prices = { hm: 72, zara: 82, boozt: 65, kicks: 78, ellos: 68 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '37',
      name: 'Terry Cloth Lounge Shorts',
      brand: 'Arket',
      category: 'Fashion' as const,
      image: productImages.terryShorts,
      sku: 'ARK-TERRY-SHORT',
      matchType: 'exact' as const,
      description: 'Cosy terry shorts in cream. Perfect for beach days and lazy Sundays.',
      rating: 4.4,
      reviewCount: 201,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '37'),
      trending: true,
      trendingScore: 7.9,
    };
  })(),
  (() => {
    const prices = { hm: 128, zara: 148, boozt: 118, kicks: 138, ellos: 122 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: false, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '38',
      name: 'Off-Shoulder Ruffle Top',
      brand: 'Guizio',
      category: 'Fashion' as const,
      image: productImages.ruffleTop,
      sku: 'GUZ-RUFFLE-OFF',
      matchType: 'exact' as const,
      description: 'Romantic off-shoulder top with tiered ruffles in soft white cotton.',
      rating: 4.7,
      reviewCount: 367,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '38'),
      trending: true,
      trendingScore: 8.5,
    };
  })(),
  (() => {
    const prices = { hm: 168, zara: 188, boozt: 158, kicks: 178, ellos: 162 };
    const inStock = { hm: true, zara: true, boozt: true, kicks: true, ellos: true };
    const stats = computePriceStats(prices, inStock);
    return {
      id: '39',
      name: 'Sage Linen Romper',
      brand: 'Réalisation Par',
      category: 'Fashion' as const,
      image: productImages.summerRomper,
      sku: 'REAL-SAGE-ROMP',
      matchType: 'near' as const,
      description: 'One-piece linen romper with tie waist and sweetheart neckline. Effortless summer look.',
      rating: 4.8,
      reviewCount: 445,
      prices, inStock, ...stats,
      priceHistory: generatePriceHistory(stats.lowestPrice, '39'),
      trending: true,
      trendingScore: 9.0,
    };
  })(),
];
