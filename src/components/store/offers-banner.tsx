'use client';

import { useWhatsappUrl } from '@/components/providers';
import { BRAND } from '@/lib/brand';

const MESSAGE =
  'ന്തൊക്കെ ണ്ട് വിശേഷം , സുഖല്ലേ ? .. സൈറ്റിൽ ഒരു വിധം സാനം ഒക്കെ ണ്ട് .. സൈസ് തെറ്റി ഓർഡർ ആകരുത് ട്ടോ .. ശ്രെദ്ദികൊണ്ടു .. ഒക്കെ താങ്ക്യൂ .. ചോദ്യങ്ങളൊക്കെ  അജുനോട് വട്സാപ്പില് ചോയ്ക്കലോ  .. അടീൽ "  "ഒടെ  ന്റെ സാനം "ബട്ടൺ കണ്ടീലെ.. അയ്‌മേ ക്ലിക്ക് ..';

export function OffersBanner() {
  const waUrl = useWhatsappUrl();
  return (
    <a
      href={waUrl(`Hi AJ, doubt ഉണ്ട് — ${BRAND.domain}`)}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden border-y-2 border-[#b42318] bg-[#fff3cd] py-1.5 text-[#b42318]"
      aria-label="Live store notice"
    >
      <div className="offers-marquee flex w-max whitespace-nowrap font-ml text-[12px] font-bold tracking-[0.02em]">
        <span className="inline-flex items-center gap-10 px-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={`a-${index}`} className="inline-flex items-center gap-10">
              <span>{MESSAGE}</span>
              <span aria-hidden>★</span>
            </span>
          ))}
        </span>
        <span className="inline-flex items-center gap-10 px-4" aria-hidden>
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={`b-${index}`} className="inline-flex items-center gap-10">
              <span>{MESSAGE}</span>
              <span>★</span>
            </span>
          ))}
        </span>
      </div>
    </a>
  );
}
