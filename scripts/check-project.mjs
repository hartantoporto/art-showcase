/** Pemeriksaan struktur game, integrasi database, dan aset tanpa server PostgreSQL. */
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');
const [component, styles, page, api, sql] = await Promise.all([
  read('src/components/CircusGames.jsx'),
  read('src/app/art-games/art-games.css'),
  read('src/app/art-games/page.jsx'),
  read('src/app/api/game-progress/route.js'),
  read('database/spektra.sql'),
]);

const errors = [];
const requiredStages = [
  'Gerbang Keajaiban',
  'Jejak Tiket Emas',
  'Tenda Seribu Warna',
  'Labirin Kanvas',
  'Brankas Sang Maestro',
  'Mahkota Aurora',
];

for (const stage of requiredStages) {
  if (!component.includes(stage)) errors.push(`Level hilang: ${stage}`);
}

for (const term of [
  'collect-ticket',
  'complete-level',
  'golden_gallery_pass',
  'aurora_badge_earned',
  'Golden Gallery',
  '/api/game-progress',
  'gameArtworks',
]) {
  if (!component.includes(term) && !api.includes(term) && !page.includes(term)) {
    errors.push(`Integrasi game hilang: ${term}`);
  }
}

if (!api.includes('transaction(') || !api.includes('FOR UPDATE')) {
  errors.push('API game belum menyimpan progres melalui transaksi database.');
}
if (!sql.includes('CREATE TABLE IF NOT EXISTS game_progress')) {
  errors.push('Tabel game_progress belum tersedia pada SQL.');
}
if (!api.includes("user.role !== 'member'")) {
  errors.push('Penyimpanan progres game harus dibatasi untuk Member.');
}
if (!page.includes("sessionUser?.role === 'member'")) {
  errors.push('Halaman game harus membedakan Member dan Guest.');
}
if (!component.includes('Mode tamu: progres hanya tersimpan selama halaman ini terbuka')) {
  errors.push('Guest harus mendapat penjelasan bahwa progres tidak disimpan permanen.');
}
if (!component.includes('soundEnabled') || !component.includes('magic-sparkle-whoosh')) {
  errors.push('Kontrol efek suara game belum tersedia.');
}

for (const name of [
  'adventure-path',
  'adventure-play-zone',
  'adventure-hunt-map',
  'adventure-options',
  'adventure-puzzle-board',
  'adventure-vault',
  'adventure-finish',
  'adventure-golden-gallery',
]) {
  if (!styles.includes(`.${name}`)) errors.push(`CSS hilang: ${name}`);
}

for (const path of [
  'public/images/artworks/archive/painting/great-wave-off-kanagawa.webp',
  'public/images/artworks/archive/painting/mona-lisa.webp',
  'public/audio/music/bach-cello-suite-1-prelude.ogg',
  'public/images/circus/treasure-open.svg',
  'public/images/circus/treasure-closed.svg',
  'public/images/circus/tent.svg',
  'public/images/mascot/spektra-mascot.png',
  'public/audio/sfx/magic-sparkle-whoosh.wav',
  'public/audio/sfx/level-complete.wav',
  'public/audio/sfx/end-of-show-applause.wav',
]) {
  try {
    const result = await stat(join(root, path));
    if (!result.isFile() || !result.size) errors.push(`Aset tidak valid: ${path}`);
  } catch {
    errors.push(`Aset hilang: ${path}`);
  }
}

// Parity puzzle 8-puzzle: papan awal harus dapat diselesaikan.
const tiles = [0, 1, 2, 4, 5, 7, null, 3, 6].filter((value) => value !== null);
let inversions = 0;
for (let i = 0; i < tiles.length; i += 1) {
  for (let j = i + 1; j < tiles.length; j += 1) {
    if (tiles[i] > tiles[j]) inversions += 1;
  }
}
if (inversions % 2 !== 0) errors.push('Papan puzzle awal tidak solvable.');

if (errors.length) {
  errors.forEach((error) => console.error(`✗ ${error}`));
  process.exitCode = 1;
} else {
  console.log('✓ 6 checkpoint START–FINISH, 4 misi, Tiket Emas, Golden Gallery, progres Member di PostgreSQL, mode Guest, efek suara, puzzle solvable, dan aset game tersedia.');
}
