'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type AnimatedKeralaLogoProps = {
  className?: string;
  width?: number;
  title?: string;
};

/**
 * Circular Kerala Store badge with layered SVG motion:
 * elephants walk, palms sway, birds fly, water shimmers.
 */
export function AnimatedKeralaLogo({
  className,
  width = 150,
  title = 'The Kerala Store',
}: AnimatedKeralaLogoProps) {
  const clipId = useId().replace(/:/g, '');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={width}
      height={width}
      role="img"
      aria-label={title}
      className={cn('kerala-logo drop-shadow-[0_8px_28px_rgba(29,77,62,0.16)]', className)}
    >
      <title>{title}</title>
      <defs>
        <clipPath id={clipId}>
          <circle cx="200" cy="200" r="168" />
        </clipPath>
      </defs>

      {/* Outer rings */}
      <circle cx="200" cy="200" r="196" fill="#1a4d3a" />
      <circle cx="200" cy="200" r="188" fill="#f5f0e6" />
      <circle
        cx="200"
        cy="200"
        r="178"
        fill="none"
        stroke="#c9a86c"
        strokeWidth="3.5"
      />
      <circle cx="200" cy="200" r="168" fill="#f5f0e6" />

      <g clipPath={`url(#${clipId})`}>
        {/* Scene */}
        <g className="kerala-logo-scene" fill="#1a4d3a">
          {/* Left bushes */}
          <g className="kerala-logo-sway-slow">
            <ellipse cx="52" cy="168" rx="18" ry="22" />
            <ellipse cx="72" cy="160" rx="14" ry="18" />
          </g>

          {/* Palm trees */}
          <g className="kerala-logo-palm">
            <path
              d="M98 188 C96 150 94 118 92 88"
              fill="none"
              stroke="#1a4d3a"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <g className="kerala-logo-fronds">
              <path d="M92 90 C70 78 52 72 38 74" fill="none" stroke="#1a4d3a" strokeWidth="4" strokeLinecap="round" />
              <path d="M92 90 C74 68 60 52 52 42" fill="none" stroke="#1a4d3a" strokeWidth="4" strokeLinecap="round" />
              <path d="M92 90 C92 68 96 48 102 34" fill="none" stroke="#1a4d3a" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M92 90 C108 70 122 58 134 52" fill="none" stroke="#1a4d3a" strokeWidth="4" strokeLinecap="round" />
              <path d="M92 90 C112 82 128 80 142 84" fill="none" stroke="#1a4d3a" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          </g>

          <g className="kerala-logo-palm-alt">
            <path
              d="M118 188 C117 155 116 128 115 102"
              fill="none"
              stroke="#1a4d3a"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <g className="kerala-logo-fronds-alt">
              <path d="M115 104 C98 94 84 90 72 92" fill="none" stroke="#1a4d3a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M115 104 C102 86 94 72 90 60" fill="none" stroke="#1a4d3a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M115 104 C118 84 124 70 132 58" fill="none" stroke="#1a4d3a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M115 104 C130 96 142 96 152 100" fill="none" stroke="#1a4d3a" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>

          {/* Right trees */}
          <g className="kerala-logo-sway">
            <path d="M300 188 C298 160 292 140 286 128 C280 148 276 168 278 188 Z" />
            <path d="M318 188 C320 155 328 132 338 118 C346 138 348 164 346 188 Z" />
            <path d="M332 188 C334 162 342 142 352 130 C358 148 360 168 358 188 Z" />
          </g>

          {/* Ground line */}
          <rect x="40" y="186" width="320" height="3.5" rx="1" />

          {/* Water ripples */}
          <g
            className="kerala-logo-water"
            fill="none"
            stroke="#1a4d3a"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          >
            <path d="M70 198 H150" />
            <path d="M165 198 H230" />
            <path d="M248 198 H320" />
            <path d="M90 206 H140" />
            <path d="M160 206 H210" />
            <path d="M230 206 H300" />
            <path d="M110 214 H180" />
            <path d="M200 214 H270" />
          </g>

          {/* Adult elephant */}
          <g className="kerala-logo-elephant">
            <g className="kerala-logo-walk-bob">
              {/* Body */}
              <ellipse cx="168" cy="158" rx="42" ry="28" />
              {/* Head */}
              <ellipse cx="210" cy="148" rx="22" ry="20" />
              {/* Ear */}
              <ellipse cx="198" cy="142" rx="14" ry="18" />
              {/* Tusk */}
              <path
                d="M224 156 Q232 162 228 170"
                fill="none"
                stroke="#1a4d3a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Trunk */}
              <path
                className="kerala-logo-trunk"
                d="M228 152 C238 158 242 170 236 178 C230 184 222 180 224 172"
                fill="none"
                stroke="#1a4d3a"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Legs — staggered stride */}
              <g className="kerala-logo-leg-a">
                <path d="M145 170 L138 186" stroke="#1a4d3a" strokeWidth="9" strokeLinecap="round" fill="none" />
              </g>
              <g className="kerala-logo-leg-b">
                <path d="M160 170 L166 186" stroke="#1a4d3a" strokeWidth="9" strokeLinecap="round" fill="none" />
              </g>
              <g className="kerala-logo-leg-b">
                <path d="M182 170 L176 186" stroke="#1a4d3a" strokeWidth="9" strokeLinecap="round" fill="none" />
              </g>
              <g className="kerala-logo-leg-a">
                <path d="M196 170 L202 186" stroke="#1a4d3a" strokeWidth="9" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>

          {/* Calf */}
          <g className="kerala-logo-calf">
            <g className="kerala-logo-walk-bob-alt">
              <ellipse cx="112" cy="170" rx="22" ry="16" />
              <ellipse cx="132" cy="164" rx="13" ry="12" />
              <ellipse cx="126" cy="160" rx="8" ry="10" />
              <path
                d="M142 166 C148 170 150 176 146 180"
                fill="none"
                stroke="#1a4d3a"
                strokeWidth="4.5"
                strokeLinecap="round"
                className="kerala-logo-trunk-sm"
              />
              <g className="kerala-logo-leg-b">
                <path d="M100 176 L96 186" stroke="#1a4d3a" strokeWidth="6" strokeLinecap="round" fill="none" />
              </g>
              <g className="kerala-logo-leg-a">
                <path d="M112 176 L116 186" stroke="#1a4d3a" strokeWidth="6" strokeLinecap="round" fill="none" />
              </g>
              <g className="kerala-logo-leg-a">
                <path d="M122 176 L118 186" stroke="#1a4d3a" strokeWidth="6" strokeLinecap="round" fill="none" />
              </g>
              <g className="kerala-logo-leg-b">
                <path d="M132 176 L136 186" stroke="#1a4d3a" strokeWidth="6" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>

          {/* Birds — outer path + inner flap (separate transforms) */}
          <g
            className="kerala-logo-birds"
            fill="none"
            stroke="#1a4d3a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className="kerala-logo-bird">
              <g className="kerala-logo-bird-flap">
                <path d="M258 80 Q268 72 278 80" />
              </g>
            </g>
            <g className="kerala-logo-bird-alt">
              <g className="kerala-logo-bird-flap">
                <path d="M283 70 Q292 62 301 70" />
              </g>
            </g>
            <g className="kerala-logo-bird">
              <g className="kerala-logo-bird-flap" style={{ animationDelay: '0.08s' }}>
                <path d="M302 90 Q310 82 318 90" />
              </g>
            </g>
            <g className="kerala-logo-bird-alt">
              <g className="kerala-logo-bird-flap" style={{ animationDelay: '0.18s' }}>
                <path d="M278 100 Q286 92 294 100" />
              </g>
            </g>
          </g>
        </g>

        {/* Wordmark */}
        <g textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif">
          <line x1="118" y1="248" x2="158" y2="248" stroke="#c9a86c" strokeWidth="1.5" />
          <line x1="242" y1="248" x2="282" y2="248" stroke="#c9a86c" strokeWidth="1.5" />
          <text x="200" y="252" fill="#1a4d3a" fontSize="14" letterSpacing="0.35em" fontWeight="600">
            THE
          </text>
          <text
            x="200"
            y="292"
            fill="#1a4d3a"
            fontSize="42"
            fontWeight="700"
            letterSpacing="0.06em"
          >
            KERALA
          </text>
          <line x1="108" y1="318" x2="148" y2="318" stroke="#c9a86c" strokeWidth="1.5" />
          <line x1="252" y1="318" x2="292" y2="318" stroke="#c9a86c" strokeWidth="1.5" />
          <text
            x="200"
            y="322"
            fill="#c9a86c"
            fontSize="22"
            fontWeight="600"
            letterSpacing="0.28em"
          >
            STORE
          </text>
          {/* Laurel */}
          <g fill="none" stroke="#1a4d3a" strokeWidth="2" strokeLinecap="round">
            <path d="M200 348 C188 344 178 338 172 330" />
            <path d="M200 348 C212 344 222 338 228 330" />
            <path d="M186 342 C182 338 180 334 178 330" />
            <path d="M214 342 C218 338 220 334 222 330" />
          </g>
          <circle cx="168" cy="348" r="2.2" fill="#c9a86c" />
          <circle cx="232" cy="348" r="2.2" fill="#c9a86c" />
        </g>
      </g>
    </svg>
  );
}
