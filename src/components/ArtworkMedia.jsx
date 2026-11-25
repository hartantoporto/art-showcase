'use client';

import { useState } from 'react';
import { FileText, Film, ImageOff, Music2 } from 'lucide-react';
import { artworkImageFallback, artworkMediaPoster } from '@/lib/artwork-media';

// MEDIA FALLBACK: file yang hilang tidak boleh menghasilkan ikon gambar rusak.
function handleImageError(event, art) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = artworkImageFallback(art);
}

function handlePosterError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = '/images/categories/music-sound.svg';
}

export default function ArtworkMedia({ art, full = false }) {
  const [mediaError, setMediaError] = useState(false);

  // STATUS MEDIA: tampilkan placeholder yang rapi jika file lokal tidak tersedia.
  if (art.media_available === false || mediaError) {
    const MissingIcon = art.media_type === 'video'
      ? Film
      : art.media_type === 'audio'
        ? Music2
        : art.media_type === 'document'
          ? FileText
          : ImageOff;

    return (
      <div className="media-placeholder" role="img" aria-label={`Media ${art.title} tidak tersedia`}>
        <MissingIcon size={48} />
        <strong>{art.title}</strong>
        <span className="text-xs">File media tidak tersedia</span>
      </div>
    );
  }

  // MEDIA GAMBAR: gunakan file asli dan fallback kategori bila browser gagal memuatnya.
  if (art.media_type === 'image') {
    return (
      <img
        src={art.media_url}
        alt={art.title}
        loading={full ? 'eager' : 'lazy'}
        onError={(event) => handleImageError(event, art)}
      />
    );
  }

  // MEDIA AUDIO: kontrol HTML5 terhubung langsung ke file audio karya.
  if (art.media_type === 'audio') {
    return (
      <section className={`media-audio ${full ? 'media-audio-full' : 'media-audio-card'}`}>
        <div className="media-audio-art">
          <img
            src={artworkMediaPoster(art)}
            alt=""
            aria-hidden="true"
            onError={handlePosterError}
          />
          <div className="media-audio-overlay">
            <span className="media-kicker"><Music2 size={14} /> SOUND ARCHIVE</span>
            <Music2 size={full ? 48 : 34} strokeWidth={1.5} />
            <strong>{art.title}</strong>
            <small>{art.original_artist || art.creator_name || 'SPEKTRA Sound Studio'}</small>
          </div>
        </div>
        <audio
          src={art.media_url}
          controls
          preload="metadata"
          className="media-audio-controls"
          aria-label={`Putar ${art.title}`}
          onError={() => setMediaError(true)}
        />
      </section>
    );
  }

  // MEDIA VIDEO: video dapat diputar, dijeda, dan diatur langsung dari kartu/detail.
  if (art.media_type === 'video') {
    return (
      <div className={`media-video ${full ? 'media-video-full' : 'media-video-card'}`}>
        <video
          src={art.media_url}
          poster={artworkMediaPoster(art)}
          controls
          preload="metadata"
          playsInline
          aria-label={art.title}
          onError={() => setMediaError(true)}
        />
        {!full && <span className="media-video-caption"><Film size={13} /> VIDEO EXHIBIT</span>}
      </div>
    );
  }

  // MEDIA DOKUMEN: PDF dibuka pada halaman detail, bukan dipaksa menjadi thumbnail.
  if (art.media_type === 'document' && full) {
    return (
      <div className="w-full h-full min-h-[520px] bg-white">
        <iframe src={art.media_url} title={art.title} className="w-full h-[600px]" />
        <a href={art.media_url} target="_blank" rel="noreferrer" className="pill pill-secondary m-4">
          Buka dokumen
        </a>
      </div>
    );
  }

  const Icon = art.media_type === 'document' ? FileText : ImageOff;
  return (
    <div className="media-placeholder">
      <Icon size={48} />
      <span className="text-xs font-black tracking-widest uppercase">{art.media_type} artwork</span>
    </div>
  );
}
