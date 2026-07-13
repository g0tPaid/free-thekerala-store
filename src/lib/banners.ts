export type HomeBanner = {
  id: string;
  imageUrl: string;
  href?: string | null;
  title?: string | null;
};

/** Pool of banner images — 3 are picked at random when admin URLs are empty. */
export const BANNER_IMAGE_POOL = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=80',
    title: 'Spices from home',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=80',
    title: 'Festive sweets',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1400&q=80',
    title: 'Kerala kitchen',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=80',
    title: 'Warm snacks',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1400&q=80',
    title: 'Home feast',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
    title: 'Fresh plates',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
    title: 'Gift moments',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1400&q=80',
    title: 'Everyday care',
  },
] as const;

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function pickRandomBanners(count = 3): HomeBanner[] {
  return shuffle([...BANNER_IMAGE_POOL])
    .slice(0, count)
    .map((item, index) => ({
      id: String(index + 1),
      imageUrl: item.imageUrl,
      href: null,
      title: item.title,
    }));
}

/** Static fallbacks if random pick is skipped. */
export const DEFAULT_HOME_BANNERS: HomeBanner[] = pickRandomBanners(3);

export function resolveHomeBanners(input?: {
  banner1Url?: string | null;
  banner2Url?: string | null;
  banner3Url?: string | null;
  banner1Link?: string | null;
  banner2Link?: string | null;
  banner3Link?: string | null;
} | null): HomeBanner[] {
  const custom = [
    {
      id: '1',
      imageUrl: input?.banner1Url?.trim() || '',
      href: input?.banner1Link?.trim() || null,
      title: 'Banner 1',
    },
    {
      id: '2',
      imageUrl: input?.banner2Url?.trim() || '',
      href: input?.banner2Link?.trim() || null,
      title: 'Banner 2',
    },
    {
      id: '3',
      imageUrl: input?.banner3Url?.trim() || '',
      href: input?.banner3Link?.trim() || null,
      title: 'Banner 3',
    },
  ];

  const filled = custom.filter((slot) => Boolean(slot.imageUrl));
  // Only show admin-uploaded banners — don't mix random art that hides updates
  if (filled.length > 0) return filled;

  return DEFAULT_HOME_BANNERS;
}
