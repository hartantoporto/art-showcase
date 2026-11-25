'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
} from 'lucide-react';
import { artworkImageFallback } from '@/lib/artwork-media';

function CarouselImage({ art, alt, eager }) {
  function handleError(event) {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied === 'true') return;

    image.dataset.fallbackApplied = 'true';
    image.src = artworkImageFallback(art);
  }

  return (
    <img
      src={art.media_url}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={handleError}
    />
  );
}

// Carousel bergerak otomatis, tetapi dapat dihentikan dan dinavigasi manual.
export default function CircusCarousel({ artworks = [] }) {
  const items = artworks
    .filter((art) => art.media_type === 'image' && art.media_url)
    .slice(0, 7);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % items.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  if (!items.length) {
    return (
      <div className="circus-carousel-empty">
        Karya akan tampil di panggung setelah data demo diisi melalui{' '}
        <code>npm run db:seed</code>.
      </div>
    );
  }

  const step = (direction) => {
    setActive((current) => (
      current + direction + items.length
    ) % items.length);
  };

  function offset(index) {
    const raw = (index - active + items.length) % items.length;
    return raw > Math.floor(items.length / 2)
      ? raw - items.length
      : raw;
  }

  return (
    <div
      className="circus-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="circus-carousel-stars" aria-hidden="true">
        ✦ &nbsp; ✧ &nbsp; ✦
      </div>

      <div className="circus-carousel-stage" aria-label="Carousel karya seni pilihan">
        {items.map((art, index) => {
          const position = offset(index);
          const isCenter = position === 0;
          const isVisible = Math.abs(position) <= 2;
          const transform = [
            `translateX(${position * 67}%)`,
            `translateY(${Math.abs(position) * 30}px)`,
            `rotate(${position * -7}deg)`,
            `scale(${1 - Math.abs(position) * 0.12})`,
          ].join(' ');

          return (
            <div
              key={art.id}
              className={`circus-carousel-card ${isCenter ? 'is-center' : ''}`}
              style={{
                transform,
                zIndex: 10 - Math.abs(position),
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
            >
              {isCenter ? (
                <Link
                  href={`/artwork/${art.id}`}
                  className="circus-carousel-media"
                  aria-label={`Lihat karya ${art.title}`}
                >
                  <CarouselImage art={art} alt={art.title} eager />
                  <span className="circus-carousel-see">
                    View masterpiece <ArrowUpRight size={16} />
                  </span>
                </Link>
              ) : (
                <button
                  className="circus-carousel-media"
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Pilih karya ${art.title}`}
                  tabIndex={isVisible ? 0 : -1}
                >
                  <CarouselImage
                    art={art}
                    alt=""
                    eager={Math.abs(position) <= 1}
                  />
                </button>
              )}

              <div className="circus-carousel-caption">
                <strong>{art.title}</strong>
                <span>
                  {art.original_artist || art.creator_name || 'SPEKTRA Creator'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="circus-carousel-controls">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Karya sebelumnya"
        >
          <ArrowLeft size={19} />
        </button>
        <span aria-live="polite">
          {String(active + 1).padStart(2, '0')} /{' '}
          {String(items.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Karya berikutnya"
        >
          <ArrowRight size={19} />
        </button>
        <button
          type="button"
          className="circus-pause"
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? 'Putar otomatis' : 'Jeda carousel'}
        >
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </button>
      </div>
    </div>
  );
}
