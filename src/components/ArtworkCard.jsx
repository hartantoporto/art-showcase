'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Bookmark, Eye, Heart } from 'lucide-react';
import ArtworkMedia from './ArtworkMedia';
import { countryFlag, countryName } from '@/lib/countries';


// KARTU ARTWORK: menampilkan media, kreator, jumlah Like, dan aksi Favorites.
export default function ArtworkCard({ art, user }) {
  const router = useRouter();
  const member = user?.role === 'member';
  const guest = !user;

  const [liked, setLiked] = useState(Boolean(art.liked));
  const [saved, setSaved] = useState(Boolean(art.favorited));
  const [count, setCount] = useState(Number(art.like_count) || 0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function toggle(op) {
    if (!member || busy) return;

    setBusy(true);
    setNotice('');

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op, artwork_id: art.id }),
      });

      const result = await response.json().catch(() => ({
        error: 'Respons server tidak valid.',
      }));

      if (!response.ok) {
        throw new Error(result.error || 'Aksi gagal disimpan.');
      }

      if (op === 'like') {
        setLiked(Boolean(result.active));
        setCount(Number(result.likes) || 0);
        setNotice(result.active ? 'Karya disukai ♥' : 'Like dibatalkan');
      }

      if (op === 'favorite') {
        setSaved(Boolean(result.active));
        setNotice(
          result.active
            ? 'Tersimpan di Favorites ✓'
            : 'Dihapus dari Favorites',
        );
        router.refresh();
      }
    } catch (error) {
      setNotice(error?.message || 'Tidak dapat menghubungi server.');
    } finally {
      setBusy(false);
    }
  }

  const loginUrl = `/login?next=${encodeURIComponent(`/artwork/${art.id}`)}`;
  const playableMedia = art.media_type === 'audio' || art.media_type === 'video';

  return (
    <article className="art-card fade-in">
      {playableMedia ? (
        <div className="art-frame art-frame-playable">
          <ArtworkMedia art={art} />
        </div>
      ) : (
        <Link
          href={`/artwork/${art.id}`}
          className="art-frame"
          aria-label={`Lihat ${art.title}`}
        >
          <ArtworkMedia art={art} />
          <div className="art-frame-overlay">
            <span className="flex items-center gap-1 text-xs font-bold">
              <Eye size={15} />
              View artwork
            </span>
            <ArrowUpRight size={17} />
          </div>
        </Link>
      )}

      <div className="art-info">
        <div className="art-metadata">
          <Link
            href={`/artwork/${art.id}`}
            className="art-title"
            title={art.title}
          >
            {art.title}
          </Link>
          <span
            title={countryName(art.country_code)}
            aria-label={countryName(art.country_code)}
            className="text-base"
          >
            {countryFlag(art.country_code)}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2 mt-1">
          {art.original_artist ? (
            <Link href={`/artwork/${art.id}`} className="art-creator">
              Original artist: {art.original_artist}
            </Link>
          ) : (
            <Link href={`/creators/${art.user_id}`} className="art-creator">
              by {art.creator_name}
            </Link>
          )}

          <div className="flex items-center shrink-0">
            {member ? (
              <>
                <button
                  type="button"
                  disabled={busy}
                  aria-pressed={liked}
                  aria-label={liked ? 'Unlike artwork' : 'Like artwork'}
                  title={liked ? 'Unlike' : 'Like'}
                  className={`heart-btn ${liked ? 'active' : ''}`}
                  onClick={() => toggle('like')}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  {count}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  aria-pressed={saved}
                  aria-label={saved ? 'Remove from Favorites' : 'Save to Favorites'}
                  title={saved ? 'Remove from Favorites' : 'Save to Favorites'}
                  className={`heart-btn ${saved ? 'active' : ''}`}
                  onClick={() => toggle('favorite')}
                >
                  <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                </button>
              </>
            ) : guest ? (
              <>
                <Link
                  href={loginUrl}
                  title="Login sebagai Member untuk Like"
                  className="heart-btn"
                  aria-label="Login to like artwork"
                >
                  <Heart size={15} />
                  {count}
                </Link>
                <Link
                  href={loginUrl}
                  title="Login sebagai Member untuk menyimpan"
                  className="heart-btn"
                  aria-label="Login to save artwork"
                >
                  <Bookmark size={15} />
                </Link>
              </>
            ) : (
              <span
                className="heart-btn"
                title="Like dan Favorites hanya untuk Member"
              >
                <Heart size={15} />
                {count}
                <span className="sr-only">Only Members can interact</span>
              </span>
            )}
          </div>
        </div>

        {notice && (
          <p role="status" className="art-card-notice">
            {notice}
          </p>
        )}
      </div>
    </article>
  );
}
