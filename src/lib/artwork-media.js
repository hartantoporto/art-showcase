// FALLBACK GAMBAR: setiap judul karya katalog memiliki aset lokal yang sesuai.
const IMAGE_FALLBACKS = {
  'mona-lisa': '/images/artworks/archive/painting/mona-lisa.webp',
  'girl-with-a-pearl-earring': '/images/artworks/archive/painting/girl-with-pearl-earring.webp',
  'the-great-wave-off-kanagawa': '/images/artworks/archive/painting/great-wave-off-kanagawa.webp',
  'the-arrest-of-pangeran-diponegoro': '/images/artworks/archive/painting/arrest-of-diponegoro.webp',
  david: '/images/artworks/archive/3d/david-michelangelo.webp',
  'bust-of-nefertiti': '/images/artworks/archive/3d/nefertiti-bust.webp',
  'the-thinker': '/images/artworks/archive/3d/the-thinker.webp',
  zodiac: '/images/artworks/archive/graphic-design/mucha-zodiac.webp',
  'le-chat-noir': '/images/artworks/archive/graphic-design/le-chat-noir.webp',
  'moulin-rouge-la-goulue': '/images/artworks/archive/graphic-design/moulin-rouge-la-goulue.webp',
  'migrant-mother': '/images/artworks/archive/photography/migrant-mother.webp',
  'the-horse-in-motion': '/images/artworks/archive/photography/horse-in-motion.webp',
  fantasmagorie: '/images/artworks/archive/animation/fantasmagorie-cohl.gif',
  'gertie-the-dinosaur': '/images/artworks/archive/animation/gertie-the-dinosaur.webp',
  'alice-in-wonderland-frontispiece': '/images/artworks/archive/digital-illustration/alice-frontispiece.webp',
  'the-raven-dore-illustration': '/images/artworks/archive/digital-illustration/dore-raven.webp',
  'the-mad-hatter': '/images/artworks/archive/digital-illustration/mad-hatter.webp',
  'the-raven-book-illustration': '/images/artworks/archive/writing/the-raven-dore.webp',
  'pride-and-prejudice-first-edition-title-page': '/images/artworks/archive/writing/pride-and-prejudice-title-page.webp',
  'alice-s-adventures-in-wonderland-1865-cover': '/images/artworks/archive/writing/alice-adventures-cover.webp',
  'chromatic-rio': '/images/artworks/world/camilarocha.svg',
  'monsoon-type': '/images/artworks/world/aaravmehta.svg',
  'atlas-clay-forms': '/images/artworks/world/salmaidrissi.svg',
  'lagos-in-motion': '/images/artworks/world/tomiadeyemi.svg',
  'a-kinder-interface': '/images/artworks/originals/a-kinder-interface.svg',
  'midnight-carnival': '/images/artworks/originals/midnight-carnival.svg',
};

// FALLBACK KATEGORI: dipakai jika gambar karya tidak dapat dipulihkan.
const CATEGORY_FALLBACKS = {
  'Digital Illustration & Drawing': '/images/categories/digital-illustration.svg',
  Photography: '/images/categories/photography.svg',
  'Painting & Traditional Art': '/images/categories/painting-traditional.svg',
  'Graphic Design & Typography': '/images/categories/graphic-design.svg',
  'UI/UX & Product Design': '/images/categories/ui-ux-product-design.svg',
  '3D Art & Sculpture': '/images/categories/3d-art-sculpture.svg',
  'Animation & Motion Graphics': '/images/categories/animation-motion.svg',
  'Film & Video': '/images/categories/film-video.svg',
  'Music & Sound': '/images/categories/music-sound.svg',
  'Writing & Mixed Media': '/images/categories/writing-mixed-media.svg',
};

export function artworkSlug(title = '') {
  return String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function artworkImageFallback(art = {}) {
  return IMAGE_FALLBACKS[artworkSlug(art.title)]
    || CATEGORY_FALLBACKS[art.category_name]
    || '/images/categories/default.svg';
}

// POSTER MEDIA: audio/video memakai poster lokal agar kartu tetap menarik sebelum diputar.
export function artworkMediaPoster(art = {}) {
  const slug = artworkSlug(art.title);
  if (slug.includes('a-trip-to-the-moon')) return '/images/posters/a-trip-to-the-moon.webp';
  if (slug.includes('nosferatu')) return '/images/posters/nosferatu.webp';
  if (slug.includes('gallery-in-motion')) return '/images/posters/spektra-motion-study.webp';
  if (slug.includes('bach')) return '/images/posters/bach-cello-suite.svg';
  if (slug.includes('mozart')) return '/images/posters/mozart-night-music.svg';
  return CATEGORY_FALLBACKS[art.category_name] || '/images/categories/music-sound.svg';
}
