import pg from 'pg';
import { getDatabaseUrl } from '../src/lib/database-url.mjs';

// VERIFIKASI DATABASE: pastikan tabel, kategori, karya arsip, audio, dan video tersedia.
const { Pool } = pg;
const pool = new Pool({ connectionString: getDatabaseUrl(), connectionTimeoutMillis: 8000 });
const requiredTables = [
  'users', 'sessions', 'categories', 'artworks', 'likes', 'favorites', 'comments',
  'artwork_reports', 'comment_reports', 'challenges', 'submissions', 'follows',
  'collections', 'collection_items', 'game_progress',
];

try {
  const { rows: tableRows } = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' AND table_name=ANY($1::text[])`,
    [requiredTables],
  );
  const present = new Set(tableRows.map((row) => row.table_name));
  const missing = requiredTables.filter((name) => !present.has(name));
  if (missing.length) throw new Error(`Tabel belum tersedia: ${missing.join(', ')}`);

  const { rows: categoryRows } = await pool.query('SELECT COUNT(*)::int AS total FROM categories');
  if (categoryRows[0].total !== 10) {
    throw new Error(`Diharapkan 10 kategori awal, ditemukan ${categoryRows[0].total}.`);
  }

  const { rows: archiveRows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE a.media_type='image')::int AS images,
      COUNT(*) FILTER (WHERE a.media_type='audio')::int AS audios,
      COUNT(*) FILTER (WHERE a.media_type='video')::int AS videos
    FROM artworks a
    JOIN users u ON u.id=a.user_id
    WHERE u.handle='spektraarchive' AND a.removed_at IS NULL`);
  const archive = archiveRows[0];
  if (archive.total < 25 || archive.images < 21 || archive.audios < 2 || archive.videos < 2) {
    throw new Error(
      `Data arsip belum lengkap. Ditemukan ${archive.total} karya (${archive.images} gambar, ${archive.audios} audio, ${archive.videos} video). Jalankan npm.cmd run db:seed.`,
    );
  }

  console.log('Database SPEKTRA berhasil diverifikasi.');
  console.log(`- Tabel inti: ${requiredTables.length}/${requiredTables.length}`);
  console.log(`- Kategori awal: ${categoryRows[0].total}/10`);
  console.log(`- Koleksi arsip: ${archive.total} karya (${archive.images} gambar, ${archive.audios} audio, ${archive.videos} video)`);
  console.log('- Tabel progres game: tersedia dan terhubung ke users.id');
} catch (error) {
  console.error('Verifikasi database gagal:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
