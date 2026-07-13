'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { HomeBanner } from '@/lib/banners';
import { cn } from '@/lib/utils';

type HeroBannersProps = {
  banners: HomeBanner[];
};

export function HeroBanners({ banners }: HeroBannersProps) {
  const slides = banners.slice(0, 3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const active = slides[index] ?? slides[0];

  const media = (
    <div className="relative aspect-[2.4/1] min-h-[140px] w-full overflow-hidden rounded-2xl bg-[#4f8f6e] sm:aspect-[2.6/1] sm:min-h-[180px]">
      {slides.map((banner, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={banner.id}
          src={banner.imageUrl}
          alt={banner.title || `Banner ${i + 1}`}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
    </div>
  );

  return (
    <section className="px-2 pb-1.5 pt-1.5" aria-label="Promotional banners">
      <div className="relative overflow-hidden rounded-2xl">
        {active.href ? (
          <Link href={active.href} className="block">
            {media}
          </Link>
        ) : (
          media
        )}

        {slides.length > 1 ? (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {slides.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
