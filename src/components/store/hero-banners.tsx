'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { HomeBanner } from '@/lib/banners';
import { cn } from '@/lib/utils';

type HeroBannersProps = {
  banners: HomeBanner[];
};

const SWIPE_THRESHOLD = 40;

export function HeroBanners({ banners }: HeroBannersProps) {
  const slides = banners.slice(0, 3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length, paused]);

  if (!slides.length) return null;

  function go(delta: number) {
    setIndex((current) => (current + delta + slides.length) % slides.length);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (slides.length <= 1) return;
    dragStartX.current = event.clientX;
    dragging.current = false;
    setPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartX.current == null) return;
    if (Math.abs(event.clientX - dragStartX.current) > 8) {
      dragging.current = true;
    }
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartX.current == null) return;
    const delta = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      go(delta < 0 ? 1 : -1);
    }

    window.setTimeout(() => {
      dragging.current = false;
      setPaused(false);
    }, 50);
  }

  function onClickCapture(event: React.MouseEvent) {
    // Block link navigation after a swipe
    if (dragging.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  const media = (
    <div
      className="relative aspect-[12/5] min-h-[140px] w-full touch-pan-y overflow-hidden rounded-2xl bg-[#4f8f6e] sm:min-h-[180px]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {slides.map((banner, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${banner.id}-${banner.imageUrl}`}
          src={banner.imageUrl}
          alt={banner.title || `Banner ${i + 1}`}
          draggable={false}
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
    </div>
  );

  const active = slides[index] ?? slides[0];

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
          <div className="absolute bottom-3 left-0 right-0 z-10 flex items-center justify-center gap-2">
            {slides.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => {
                  setIndex(i);
                  setPaused(true);
                  window.setTimeout(() => setPaused(false), 4500);
                }}
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
