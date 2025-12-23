/**
 * Logo Carousel Component
 * 
 * Infinite scrolling logo carousel for social proof.
 * Shows company logos with smooth CSS animation.
 * 
 * @module components/logo-carousel
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ========================================
// COMPANY LOGOS - SVG Icons for Enterprise Social Proof
// ========================================

interface LogoItem {
  id: string;
  name: string;
  width?: number;
  logo: React.ReactNode;
}

// Enterprise-focused company logos (stylized representations)
const logos: LogoItem[] = [
  { 
    id: 'google', 
    name: 'Google', 
    width: 100,
    logo: (
      <svg viewBox="0 0 74 24" className="h-6 w-auto fill-current">
        <path d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.94 1.08 11.98 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24zM25.05 7.42c-3.2 0-5.81 2.44-5.81 5.81 0 3.35 2.6 5.81 5.81 5.81 3.2 0 5.81-2.46 5.81-5.81 0-3.37-2.61-5.81-5.81-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52zm12.65-9.33c-3.2 0-5.81 2.44-5.81 5.81 0 3.35 2.6 5.81 5.81 5.81 3.2 0 5.81-2.46 5.81-5.81 0-3.37-2.61-5.81-5.81-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52zm12.31-8.97v.68h-.08c-.57-.68-1.67-1.3-3.06-1.3-2.91 0-5.57 2.55-5.57 5.83 0 3.26 2.66 5.79 5.57 5.79 1.39 0 2.49-.62 3.06-1.32h.08v.84c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.53-1.12-2.93-2.07l-2.22.92c.64 1.54 2.34 3.43 5.15 3.43 2.99 0 5.52-1.76 5.52-6.05V7.68h-2.42v.77zm-2.92 8.95c-1.76 0-3.23-1.47-3.23-3.5 0-2.04 1.47-3.54 3.23-3.54 1.74 0 3.1 1.5 3.1 3.54 0 2.03-1.36 3.5-3.1 3.5zm6.61-15.02h2.53v17.32h-2.53V1.73zm10.32 5.69c-3.03 0-5.48 2.38-5.48 5.81 0 3.28 2.26 5.81 5.77 5.81 2.37 0 3.72-1.3 4.52-2.46l-1.85-1.24c-.49.73-1.16 1.4-2.68 1.4-1.22 0-2.09-.56-2.64-1.66l7.29-3.01-.24-.58c-.45-1.13-1.82-4.07-5.69-4.07zm.15 2.24c.97 0 1.79.49 2.07 1.19l-4.94 2.05c-.14-1.91 1.49-3.24 2.87-3.24z"/>
      </svg>
    )
  },
  { 
    id: 'microsoft', 
    name: 'Microsoft', 
    width: 120,
    logo: (
      <svg viewBox="0 0 23 23" className="h-5 w-auto">
        <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022"/>
        <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7FBA00"/>
        <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
      </svg>
    )
  },
  { 
    id: 'amazon', 
    name: 'Amazon', 
    width: 100,
    logo: (
      <svg viewBox="0 0 100 30" className="h-5 w-auto fill-current">
        <path d="M62.4 22.8c-5.8 4.3-14.2 6.6-21.4 6.6-10.1 0-19.2-3.7-26.1-9.9-.5-.5-.1-1.1.6-.8 7.4 4.3 16.6 6.9 26.1 6.9 6.4 0 13.4-1.3 19.9-4.1 1-.4 1.8.7.9 1.3z"/>
        <path d="M64.8 20.1c-.7-.9-4.8-.4-6.6-.2-.6.1-.7-.4-.2-.8 3.2-2.3 8.5-1.6 9.1-.9.6.8-.2 6.2-3.2 8.8-.5.4-.9.2-.7-.3.7-1.7 2.2-5.7 1.6-6.6z"/>
        <path d="M58.4 3.5V1.2c0-.3.3-.6.6-.6h10.3c.3 0 .6.2.6.5V3c0 .3-.3.7-.8 1.4l-5.3 7.6c2 0 4.1.2 5.9 1.2.4.2.5.6.5.9v2.5c0 .4-.4.8-.8.6-3.4-1.8-7.9-2-11.6.1-.4.2-.8-.2-.8-.6v-2.4c0-.4 0-1 .4-1.6l6.2-8.8h-5.4c-.3 0-.6-.2-.6-.5v.1z"/>
        <path d="M21.4 17.1h-3.1c-.3 0-.5-.2-.6-.5V1.3c0-.3.3-.6.6-.6h2.9c.3 0 .5.2.6.5v2h.1c.8-1.9 2.2-2.8 4.2-2.8 2 0 3.3.9 4.2 2.8.8-1.9 2.5-2.8 4.4-2.8 1.3 0 2.8.5 3.7 1.8 1 1.4.8 3.4.8 5.2v9.1c0 .3-.3.6-.6.6h-3.1c-.3 0-.5-.2-.6-.5V7.2c0-.7.1-2.4-.1-3.1-.3-1.1-1-1.4-2-1.4-.8 0-1.7.5-2 1.4-.4.9-.3 2.3-.3 3.1v9.4c0 .3-.3.6-.6.6h-3.1c-.3 0-.5-.2-.6-.5V7.2c0-1.8.3-4.5-2.1-4.5-2.4 0-2.3 2.6-2.3 4.5v9.4c-.1.2-.4.5-.7.5z"/>
        <path d="M46.7.4c4.6 0 7.1 4 7.1 9 0 4.9-2.8 8.7-7.1 8.7-4.5 0-7-4-7-8.9 0-4.9 2.5-8.8 7-8.8zm0 3.2c-2.3 0-2.4 3.1-2.4 5.1 0 1.9 0 6.2 2.4 6.2 2.3 0 2.5-3.4 2.5-5.5 0-1.4-.1-3-.4-4.3-.3-1-1-1.5-2.1-1.5z"/>
      </svg>
    )
  },
  { 
    id: 'meta', 
    name: 'Meta', 
    width: 90,
    logo: (
      <svg viewBox="0 0 36 24" className="h-5 w-auto fill-current">
        <path d="M8.04 3.45c-1.72 0-3.2.72-4.4 2.52C2.04 8.17 0 13.3 0 16.02c0 2.38 1.27 4.44 3.92 4.44 1.88 0 3.75-1.52 5.58-4.27.32-.5.65-1.02.97-1.55.33.53.66 1.05.98 1.55 1.83 2.75 3.7 4.27 5.58 4.27 2.65 0 3.92-2.06 3.92-4.44 0-2.72-2.04-7.85-3.64-10.05-1.2-1.8-2.68-2.52-4.4-2.52-1.86 0-3.44 1.43-4.93 4.04-1.49-2.61-3.08-4.04-4.94-4.04zm.24 3.45c.69 0 1.52.76 2.54 2.32 1.1 1.66 2.32 4.3 2.32 5.35 0 .8-.3 1.35-.98 1.35-.82 0-1.88-1.08-3.06-2.88-1.22-1.87-1.92-3.72-1.92-4.82 0-.78.36-1.32 1.1-1.32zm8.35 0c.74 0 1.1.54 1.1 1.32 0 1.1-.7 2.95-1.92 4.82-1.18 1.8-2.24 2.88-3.06 2.88-.68 0-.98-.55-.98-1.35 0-1.05 1.22-3.69 2.32-5.35 1.02-1.56 1.85-2.32 2.54-2.32z"/>
        <path d="M31.67 6.2c-2.16 0-3.58 1.83-3.58 4.97v7.36c0 .55.43.98.98.98h2.88c.54 0 .97-.43.97-.98V6.5h-1.25z"/>
        <circle cx="32.3" cy="2.62" r="2.16"/>
      </svg>
    )
  },
  { 
    id: 'salesforce', 
    name: 'Salesforce', 
    width: 110,
    logo: (
      <svg viewBox="0 0 50 35" className="h-6 w-auto fill-current">
        <path d="M20.9 6.2c1.4-1.5 3.4-2.4 5.6-2.4 2.8 0 5.3 1.5 6.7 3.8 1.2-.5 2.5-.8 3.9-.8 5.5 0 10 4.5 10 10s-4.5 10-10 10H8.5c-4.7 0-8.5-3.8-8.5-8.5 0-4.3 3.2-7.9 7.4-8.4.1-4.9 4.1-8.8 9-8.8 2 0 3.8.6 5.3 1.7.3.2.7.5 1 .8-.6.5-1.2 1.1-1.6 1.8-.1.1-.1.2-.2.3-.1.1-.2.3-.3.4-.1.2-.2.3-.2.5-.1.2-.2.4-.2.6-.1.2-.1.4-.2.6 0 .1 0 .2-.1.3 0 .2-.1.4-.1.6 0 .2 0 .4-.1.6v.5c0 .2 0 .4.1.6 0 .2.1.4.1.6 0 .1 0 .2.1.3.1.2.1.4.2.6.1.2.1.4.2.6.1.2.2.3.2.5.1.1.2.3.3.4.1.1.1.2.2.3.5.6 1 1.2 1.6 1.8-.3.3-.7.5-1 .8-1.5 1.1-3.3 1.7-5.3 1.7-4.9 0-8.9-3.9-9-8.8-4.2-.5-7.4-4.1-7.4-8.4 0-4.7 3.8-8.5 8.5-8.5h28.6c5.5 0 10 4.5 10 10s-4.5 10-10 10c-1.4 0-2.7-.3-3.9-.8-1.4 2.3-3.9 3.8-6.7 3.8-2.2 0-4.2-.9-5.6-2.4"/>
      </svg>
    )
  },
  { 
    id: 'oracle', 
    name: 'Oracle', 
    width: 100,
    logo: (
      <svg viewBox="0 0 100 20" className="h-4 w-auto fill-current">
        <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10h80c5.5 0 10-4.5 10-10S95.5 0 90 0H10zm0 3h80c3.9 0 7 3.1 7 7s-3.1 7-7 7H10c-3.9 0-7-3.1-7-7s3.1-7 7-7z"/>
        <text x="50" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="Arial">ORACLE</text>
      </svg>
    )
  },
  { 
    id: 'ibm', 
    name: 'IBM', 
    width: 80,
    logo: (
      <svg viewBox="0 0 60 24" className="h-5 w-auto fill-current">
        <path d="M0 0h24v3H0zM0 5h24v3H0zM0 10h24v3H0zM0 15h12v3H0zM0 20h12v3H0z"/>
        <path d="M30 0h6v23h-6zM42 0h12c3.3 0 6 2.7 6 6s-2.7 6-6 6h-6v11h-6V0zm6 9h6c1.7 0 3-1.3 3-3s-1.3-3-3-3h-6v6z"/>
      </svg>
    )
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    width: 110,
    logo: (
      <svg viewBox="0 0 84 21" className="h-5 w-auto fill-current">
        <path d="M5.4 21H.4V7h5V21zM2.9 5.1C1.3 5.1 0 3.8 0 2.2S1.3 0 2.9 0s2.9 1.3 2.9 2.9c0 1.6-1.3 2.9-2.9 2.9-.1-.7-.1-.7 0 0zM21 21h-5v-6.8c0-1.6 0-3.7-2.2-3.7-2.3 0-2.6 1.8-2.6 3.6V21H6.1V7h4.8v1.9h.1c.7-1.3 2.3-2.6 4.7-2.6 5 0 5.9 3.3 5.9 7.6V21h-.6z"/>
        <path d="M29 21h-5V0h5v21zM36 21h-5V7h5v14zM33.5 5.1c-1.6 0-2.9-1.3-2.9-2.9s1.3-2.9 2.9-2.9 2.9 1.3 2.9 2.9-1.3 2.9-2.9 2.9zM50 21h-5v-6.8c0-1.6 0-3.7-2.2-3.7-2.3 0-2.6 1.8-2.6 3.6V21h-5V7h4.8v1.9h.1c.7-1.3 2.3-2.6 4.7-2.6 5 0 5.9 3.3 5.9 7.6V21H50z"/>
        <path d="M58 21h-5V0h5v8.4l4.6-5.4h6.2l-6.1 7 6.7 11h-6l-4.3-7.5-1.1 1.2V21z"/>
        <path d="M79 14.5c0 1.9-1.6 3.5-3.5 3.5S72 16.4 72 14.5V7h-3v7.5c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5V7h-3v7.5z"/>
      </svg>
    )
  },
];

// ========================================
// COMPONENT
// ========================================

interface LogoCarouselProps {
  title?: string;
  className?: string;
}

export function LogoCarousel({ title, className = '' }: LogoCarouselProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section 
      ref={ref}
      className={`py-12 md:py-16 bg-white border-y border-zinc-100 overflow-hidden ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium text-zinc-500 mb-8"
        >
          {title || t('logoCarousel.title', 'Trusted by leading enterprises worldwide')}
        </motion.p>

        {/* Carousel Container */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex overflow-hidden"
          >
            <div className="flex animate-scroll gap-16 items-center">
              {/* First set */}
              {logos.map((logo) => (
                <LogoItem key={`${logo.id}-1`} logo={logo} />
              ))}
              {/* Duplicate for seamless loop */}
              {logos.map((logo) => (
                <LogoItem key={`${logo.id}-2`} logo={logo} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

// ========================================
// LOGO ITEM COMPONENT
// ========================================

interface LogoItemProps {
  logo: LogoItem;
}

function LogoItem({ logo }: LogoItemProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center h-12 px-4 text-zinc-400 hover:text-zinc-600 transition-colors duration-300"
      style={{ minWidth: logo.width }}
      title={logo.name}
    >
      {logo.logo}
    </div>
  );
}

export default LogoCarousel;
