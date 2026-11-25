/** Pemeriksaan statis SPEKTRA. Tidak memerlukan npm install atau PostgreSQL. */
import { readFile, access, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFile(join(root, path), 'utf8');
const errors = [];
const [sql, seed, countries, gitignore, env, submissionApi] = await Promise.all([
    read('database/spektra.sql'),
    read('scripts/seed.mjs'),
    read('src/lib/countries.js'),
    read('.gitignore'),
    read('.env.local'),
    read('src/app/api/submissions/route.js')
]);
const categoryLines = [...sql.matchAll(/^\('([^']+)','([^']+)','([^']*)','([^']+)','([^']*)','([^']+)'\),?$/gm)];
if (categoryLines.length !== 10)
    errors.push(`Kategori dasar harus 10; ditemukan ${categoryLines.length}.`);
const categoryNames = new Set(categoryLines.map((m) => m[1]));
for (const [, name, slug, , , , cover] of categoryLines) {
    try {
        await access(join(root, 'public', cover.slice(1)));
    }
    catch {
        errors.push(`Cover kategori tidak ditemukan: ${name} (${cover}).`);
    }
    const groups = await read('src/lib/category-groups.js');
    if (!groups.includes(`'${slug}'`))
        errors.push(`Kategori belum masuk pengelompokan homepage: ${slug}.`);
}
const blocks = {
    works: seed.split('const works = [')[1]?.split('];')[0] || '',
    archive: seed.split('const archiveWorks = [')[1]?.split('];')[0] || '',
    showcase: seed.split('const categoryShowcaseWorks = [')[1]?.split('];')[0] || '',
};
const samples = {};
const assets = new Set();
const countryCodes = new Set();
const register = (category, media, country) => {
    if (!categoryNames.has(category))
        errors.push(`Kategori seed tidak dikenal: ${category}.`);
    samples[category] = (samples[category] || 0) + 1;
    if (media)
        assets.add(media);
    if (country)
        countryCodes.add(country);
};
for (const line of blocks.works.split('\n')) {
    const m = line.match(/^\s*\[\s*'[^']+'\s*,\s*'[^']+'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([A-Z]+)'/);
    if (m)
        register(m[1], m[2], m[3]);
}
for (const line of blocks.archive.split('\n')) {
    const category = line.match(/category:\s*'([^']+)'/)?.[1];
    const media = line.match(/media:\s*'([^']+)'/)?.[1];
    const country = line.match(/country:\s*'([A-Z]+)'/)?.[1];
    if (category)
        register(category, media, country);
}
for (const line of blocks.showcase.split('\n')) {
    const category = line.match(/category:\s*'([^']+)'/)?.[1];
    const media = line.match(/media:\s*'([^']+)'/)?.[1];
    if (category)
        register(category, media, 'ID');
}
for (const category of categoryNames) {
    const n = samples[category] || 0;
    if (n < 1 || n > 5)
        errors.push(`Kategori '${category}' memiliki ${n} karya awal; target 1–5.`);
}
const archiveCount = (blocks.archive.match(/\{\s*title:/g) || []).length;
const totalSamples = Object.values(samples).reduce((a, b) => a + b, 0);
const archiveImageCount = (blocks.archive.match(/mediaType:\s*'image'/g) || []).length;
const archiveAudioCount = (blocks.archive.match(/mediaType:\s*'audio'/g) || []).length;
const archiveVideoCount = (blocks.archive.match(/mediaType:\s*'video'/g) || []).length;
if (totalSamples !== 30)
    errors.push(`Katalog demo harus berisi 30 karya; ditemukan ${totalSamples}.`);
if (archiveCount / Math.max(totalSamples, 1) < 0.8)
    errors.push(`Karya dari imagesforspektra harus minimal 80%; ditemukan ${archiveCount}/${totalSamples}.`);
if (archiveCount !== 24 || archiveImageCount !== 20 || archiveAudioCount !== 2 || archiveVideoCount !== 2)
    errors.push(`Paket aset harus berisi 24 karya (20 gambar, 2 audio, 2 video); ditemukan ${archiveCount} (${archiveImageCount} gambar, ${archiveAudioCount} audio, ${archiveVideoCount} video).`);
for (const asset of assets) {
    try {
        const info = await stat(join(root, 'public', asset.replace(/^\//, '')));
        if (!info.isFile() || !info.size)
            errors.push(`Aset kosong: ${asset}`);
    }
    catch {
        errors.push(`Aset karya tidak ditemukan: ${asset}`);
    }
}
if (countryCodes.size < 15)
    errors.push(`Negara asal terlalu sedikit: ${countryCodes.size}; target minimal 15.`);
for (const code of countryCodes)
    if (!countries.includes(`'${code}'`))
        errors.push(`Kode negara tidak terdaftar: ${code}.`);
const requiredMedia = [
    'public/audio/music/bach-cello-suite-1-prelude.ogg',
    'public/audio/music/mozart-eine-kleine-nachtmusik.ogg',
    'public/videos/a-trip-to-the-moon-excerpt.mp4',
    'public/videos/nosferatu-excerpt.mp4',
    'public/audio/sfx/end-of-show-applause.wav',
    'public/audio/sfx/level-complete.wav',
    'public/audio/sfx/magic-sparkle-whoosh.wav',
    'public/images/posters/a-trip-to-the-moon.webp',
    'public/images/posters/nosferatu.webp',
    'public/images/posters/spektra-motion-study.webp',
    'public/images/posters/bach-cello-suite.svg',
    'public/images/posters/mozart-night-music.svg',
    'public/images/artworks/originals/midnight-carnival.svg',
    'public/images/artworks/originals/a-kinder-interface.svg',
];
for (const path of requiredMedia) {
    try {
        const info = await stat(join(root, path));
        if (!info.isFile() || !info.size)
            errors.push(`Media wajib kosong: ${path}`);
    }
    catch {
        errors.push(`Media wajib tidak ditemukan: ${path}`);
    }
}
if (!sql.includes('CREATE TABLE IF NOT EXISTS likes') || !sql.includes('CREATE TABLE IF NOT EXISTS favorites'))
    errors.push('SQL belum memiliki tabel Like/Favorites.');
if (!sql.includes('CREATE TABLE IF NOT EXISTS game_progress'))
    errors.push('SQL belum memiliki tabel progres game.');
if (!sql.includes('ALTER TABLE artworks ALTER COLUMN creation_year TYPE TEXT'))
    errors.push('Migrasi metadata karya lama ke TEXT belum tersedia.');
for (const table of ['comments', 'artwork_reports', 'challenges', 'submissions', 'follows', 'collections', 'comment_reports']) {
    if (!sql.includes(`CREATE TABLE IF NOT EXISTS ${table}`))
        errors.push(`SQL belum memiliki tabel ${table}.`);
}
if (!sql.includes('BEGIN;') || !sql.includes('COMMIT;'))
    errors.push('SQL setup harus dibungkus transaksi.');
if (!seed.includes('UPDATE artworks SET category_id=$1,description=$2,media_url=$3,media_type=$4'))
    errors.push('Seed belum memperbarui sampel demo lama secara idempotent.');
if (!env.includes('DATABASE_URL='))
    errors.push('DATABASE_URL lokal belum ada.');
if (!gitignore.includes('.env.local'))
    errors.push('.env.local harus masuk .gitignore.');
if (!submissionApi.includes('NOW()>=c.start_at') || !submissionApi.includes('NOW()<c.end_at'))
    errors.push('Validasi periode challenge tidak ditemukan di backend.');
if (!seed.includes('work.mediaType'))
    errors.push('Media audio/video belum didukung di seed arsip.');
const mediaComponent = await read('src/components/ArtworkMedia.jsx');
if (!mediaComponent.includes('controls') || !mediaComponent.includes('preload="metadata"'))
    errors.push('Audio/video harus memiliki kontrol pemutar dan metadata preload.');
if (!mediaComponent.includes('onError'))
    errors.push('Komponen media belum memiliki fallback saat aset gagal dimuat.');
const mediaHelper = await read('src/lib/artwork-media.js');
if (!mediaHelper.includes("'mona-lisa': '/images/artworks/archive/painting/mona-lisa.webp'"))
    errors.push('Fallback lokal Mona Lisa belum terdaftar.');
if (errors.length) {
    for (const error of errors)
        console.error('✗ ' + error);
    process.exitCode = 1;
}
else {
    const total = Object.values(samples).reduce((a, b) => a + b, 0);
    console.log(`✓ ${categoryLines.length} kategori; ${total} karya awal; 24/30 karya dari imagesforspektra (80%); 20 gambar arsip, 2 audio, 2 video; ${countryCodes.size} negara; ${assets.size} aset dan konfigurasi lokal diperiksa.`);
}

