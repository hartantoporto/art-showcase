import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { query } from './db';

// PEMERIKSAAN MEDIA: pastikan path lokal menunjuk ke file yang benar-benar ada.
// URL eksternal tetap diizinkan; kegagalan jaringan ditangani oleh komponen media.
function mediaIsAvailable(mediaUrl) {
  if (typeof mediaUrl !== 'string' || !mediaUrl.trim()) return false;
  if (/^https?:\/\//i.test(mediaUrl)) return true;
  if (!mediaUrl.startsWith('/')) return false;

  try {
    const localPath = join(process.cwd(), 'public', mediaUrl.replace(/^\/+/, ''));
    return existsSync(localPath) && statSync(localPath).isFile();
  } catch {
    return false;
  }
}

function attachMediaStatus(rows) {
  return rows.map((artwork) => ({
    ...artwork,
    media_available: mediaIsAvailable(artwork.media_url),
  }));
}

// DATA KATEGORI: daftar kategori diambil langsung dari PostgreSQL.
export async function getCategories() {
  return (await query('SELECT * FROM categories ORDER BY name')).rows;
}

// PENCARIAN KARYA: ILIKE mendukung huruf kapital/kecil dan pencarian sebagian.
// Normalisasi tambahan membuat "monalisa" juga cocok dengan judul "Mona Lisa".
export async function listArtworks({
  search = '',
  category = '',
  country = '',
  media = '',
  sort = 'popular',
  limit = 40,
  userId = 0,
  owner = 0,
  favoritesOnly = false,
} = {}) {
  const safeSort = {
    popular: 'like_count DESC, a.created_at DESC',
    latest: 'a.created_at DESC',
    oldest: 'a.created_at ASC',
    title: 'a.title ASC',
  }[sort] || 'like_count DESC, a.created_at DESC';

  const searchText = String(search || '').trim().slice(0, 120);
  const compactSearch = searchText
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const statement = `
    SELECT
      a.*,
      c.name AS category_name,
      c.color AS category_color,
      c.icon AS category_icon,
      u.name AS creator_name,
      u.handle AS creator_handle,
      u.avatar_url AS creator_avatar,
      (SELECT COUNT(*)::int FROM likes l WHERE l.artwork_id=a.id) AS like_count,
      EXISTS(SELECT 1 FROM likes l WHERE l.artwork_id=a.id AND l.user_id=$1) AS liked,
      EXISTS(SELECT 1 FROM favorites f WHERE f.artwork_id=a.id AND f.user_id=$1) AS favorited
    FROM artworks a
    JOIN users u ON u.id=a.user_id
    JOIN categories c ON c.id=a.category_id
    WHERE a.removed_at IS NULL
      AND (
        $2::text=''
        OR a.title ILIKE '%'||$2||'%'
        OR u.name ILIKE '%'||$2||'%'
        OR u.handle ILIKE '%'||$2||'%'
        OR COALESCE(a.original_artist,'') ILIKE '%'||$2||'%'
        OR EXISTS (
          SELECT 1 FROM unnest(a.tags) AS tags(tag)
          WHERE tag ILIKE '%'||$2||'%'
        )
        OR (
          $9::text<>'' AND (
            regexp_replace(lower(a.title), '[^a-z0-9]', '', 'g') LIKE '%'||$9||'%'
            OR regexp_replace(lower(u.name), '[^a-z0-9]', '', 'g') LIKE '%'||$9||'%'
            OR regexp_replace(lower(u.handle), '[^a-z0-9]', '', 'g') LIKE '%'||$9||'%'
            OR regexp_replace(lower(COALESCE(a.original_artist,'')), '[^a-z0-9]', '', 'g') LIKE '%'||$9||'%'
            OR EXISTS (
              SELECT 1 FROM unnest(a.tags) AS tags(tag)
              WHERE regexp_replace(lower(tag), '[^a-z0-9]', '', 'g') LIKE '%'||$9||'%'
            )
          )
        )
      )
      AND ($3::text='' OR c.slug=$3)
      AND ($4::text='' OR a.country_code=$4)
      AND ($5::text='' OR a.media_type=$5)
      AND ($6::bigint=0 OR a.user_id=$6)
      AND ($8::boolean=FALSE OR EXISTS(
        SELECT 1 FROM favorites fv WHERE fv.artwork_id=a.id AND fv.user_id=$1
      ))
    ORDER BY ${safeSort}
    LIMIT $7`;

  const params = [
    userId,
    searchText,
    category,
    country,
    media,
    owner,
    Math.min(Math.max(Number(limit) || 40, 1), 100),
    favoritesOnly,
    compactSearch,
  ];

  const { rows } = await query(statement, params);
  return attachMediaStatus(rows);
}

// DETAIL KARYA: detail, status like/favorite, dan ketersediaan media diambil bersama.
export async function oneArtwork(id, userId = 0) {
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) return null;

  const { rows } = await query(`
    SELECT
      a.*,
      c.name AS category_name,
      c.color AS category_color,
      u.name AS creator_name,
      u.handle AS creator_handle,
      u.avatar_url AS creator_avatar,
      (SELECT COUNT(*)::int FROM likes WHERE artwork_id=a.id) AS like_count,
      EXISTS(SELECT 1 FROM likes WHERE artwork_id=a.id AND user_id=$2) AS liked,
      EXISTS(SELECT 1 FROM favorites WHERE artwork_id=a.id AND user_id=$2) AS favorited
    FROM artworks a
    JOIN users u ON u.id=a.user_id
    JOIN categories c ON c.id=a.category_id
    WHERE a.id=$1 AND a.removed_at IS NULL`, [id, userId]);

  return rows[0] ? attachMediaStatus(rows)[0] : null;
}

// KOMENTAR: hanya komentar aktif yang ditampilkan pada halaman detail karya.
export async function getComments(artId) {
  return (await query(`
    SELECT c.id,c.user_id,c.body,c.created_at,u.name,u.handle,u.avatar_url
    FROM comments c
    JOIN users u ON u.id=c.user_id
    WHERE c.artwork_id=$1 AND c.removed_at IS NULL
    ORDER BY c.created_at DESC`, [artId])).rows;
}

// CHALLENGE: status aktif, mendatang, dan berakhir dihitung berdasarkan waktu database.
export async function listChallenges({ search = '', active = false, curatorId = 0, limit = 50 } = {}) {
  return (await query(`
    SELECT
      ch.*,
      u.name AS curator_name,
      u.handle AS curator_handle,
      (SELECT COUNT(*)::int FROM submissions s WHERE s.challenge_id=ch.id) AS submission_count,
      CASE
        WHEN NOW()<ch.start_at THEN 'upcoming'
        WHEN NOW()>=ch.end_at THEN 'ended'
        ELSE 'active'
      END AS phase
    FROM challenges ch
    JOIN users u ON u.id=ch.curator_id
    WHERE ($1::text='' OR ch.title ILIKE '%'||$1||'%' OR u.name ILIKE '%'||$1||'%' OR ch.description ILIKE '%'||$1||'%')
      AND ($2::boolean=FALSE OR (NOW()>=ch.start_at AND NOW()<ch.end_at))
      AND ($3::bigint=0 OR ch.curator_id=$3)
    ORDER BY
      CASE
        WHEN NOW()>=ch.start_at AND NOW()<ch.end_at THEN 0
        WHEN NOW()<ch.start_at THEN 1
        ELSE 2
      END,
      ch.end_at ASC
    LIMIT $4`, [String(search || '').trim().slice(0, 120), active, curatorId, Math.min(Math.max(Number(limit) || 50, 1), 100)])).rows;
}

export async function oneChallenge(id) {
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) return null;
  return (await query(`
    SELECT
      ch.*,
      u.name AS curator_name,
      u.handle AS curator_handle,
      CASE
        WHEN NOW()<ch.start_at THEN 'upcoming'
        WHEN NOW()>=ch.end_at THEN 'ended'
        ELSE 'active'
      END AS phase
    FROM challenges ch
    JOIN users u ON u.id=ch.curator_id
    WHERE ch.id=$1`, [id])).rows[0] || null;
}

export async function submissionsFor(challengeId) {
  return (await query(`
    SELECT
      s.*,
      a.title AS artwork_title,
      a.media_url,
      a.media_type,
      a.country_code,
      u.name AS creator_name,
      u.handle AS creator_handle
    FROM submissions s
    JOIN artworks a ON a.id=s.artwork_id
    JOIN users u ON u.id=s.user_id
    WHERE s.challenge_id=$1 AND a.removed_at IS NULL
    ORDER BY s.winner_rank ASC NULLS LAST,s.submitted_at DESC`, [challengeId])).rows;
}

export const dateLabel = (date) => new Date(date).toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
export const formatDateTime = (date) => new Date(date).toISOString().slice(0, 16);
export const imgFallback = '/images/artworks/soul-of-color.svg';
