'use client';

import { BRAND, whatsappUrl } from '@/lib/brand';

const MESSAGE =
  'ന്തൊക്കെ വിശേഷം? സൈറ്റിൽ ഒരു വിധം എല്ലാ സാനങ്ങളും ഉണ്ടാവും .. സൈസ് തെറ്റി ഓർഡർ ആക്കരുത്. ഒന്ന് ശ്രെദ്ദികൊണ്ടു . ഓക്കേ താങ്ക്യൂ. doubts അജുനോട് ചോയ്ച്ചാ മതി .. അടീൽ whatsapp ക്ലിക്ക് ചെയ്തമതി';

export function OffersBanner() {
  return (
    <a
      href={whatsappUrl(`Hi AJ, doubt ഉണ്ട് — ${BRAND.domain}`)}
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
