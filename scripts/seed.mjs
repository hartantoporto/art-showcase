import bcrypt from 'bcryptjs';
import pg from 'pg';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabaseUrl } from '../src/lib/database-url.mjs';
const { Pool } = pg;
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const pool = new Pool({ connectionString: getDatabaseUrl(), connectionTimeoutMillis: 8000 });
let activeClient;
const sql = (statement, params = []) => (activeClient || pool).query(statement, params);
// AKUN DEMO: akun disiapkan untuk menguji peran Admin, Member, dan tiga status Curator.
const people = [
    ['SPEKTRA Admin', 'admin', 'admin@spektra.test', 'admin', null, null, 'ID'],
    ['Maya Pranata', 'maya', 'maya@spektra.test', 'member', null, null, 'ID'],
    ['Akari Mori', 'akari', 'akari@spektra.test', 'member', null, null, 'JP'],
    ['Luca Rossi', 'luca', 'luca@spektra.test', 'member', null, null, 'IT'],
    ['Noor El-Sayed', 'noor', 'noor@spektra.test', 'member', null, null, 'EG'],
    ['Solstice Creative Lab', 'solstice', 'solstice@spektra.test', 'curator', 'approved', null, 'GB'],
    ['The New Art Museum', 'newartmuseum', 'museum@spektra.test', 'curator', 'pending', null, 'FR'],
    ['Local Art Society', 'artsociety', 'society@spektra.test', 'curator', 'rejected', 'Insufficient institutional details.', 'US'],
    ['SPEKTRA Archive', 'spektraarchive', 'archive@spektra.test', 'member', null, null, 'OTHER'],
    ['Camila Rocha', 'camilarocha', 'camilarocha@spektra.test', 'member', null, null, 'BR'],
    ['Aarav Mehta', 'aaravmehta', 'aaravmehta@spektra.test', 'member', null, null, 'IN'],
    ['Salma Idrissi', 'salmaidrissi', 'salmaidrissi@spektra.test', 'member', null, null, 'MA'],
    ['Tomi Adeyemi', 'tomiadeyemi', 'tomiadeyemi@spektra.test', 'member', null, null, 'NG'],
];
// Karya kreator demo. Total contoh awal dibatasi maksimal lima per kategori.
// KARYA ORISINAL KREATOR: empat karya pelengkap untuk memperkaya kategori dan negara.
// KARYA ORISINAL KREATOR: lima karya pelengkap untuk kategori, negara, dan jenis media.
const works = [
    ['camilarocha', 'Chromatic Rio', 'Photography', '/images/artworks/world/camilarocha.svg', 'BR', 'color,urban,rio,abstract', 'An original editorial study of city rhythm, architecture, and warm coastal light.'],
    ['aaravmehta', 'Monsoon Type', 'Graphic Design & Typography', '/images/artworks/world/aaravmehta.svg', 'IN', 'type,poster,monsoon,layout', 'An original typographic poster exploring layered letters and monsoon-inspired color.'],
    ['salmaidrissi', 'Atlas Clay Forms', '3D Art & Sculpture', '/images/artworks/world/salmaidrissi.svg', 'MA', '3d,clay,sculpture,form', 'An original study of sculptural forms, soft volume, and earthy color.'],
    ['tomiadeyemi', 'Lagos in Motion', 'Animation & Motion Graphics', '/images/artworks/world/tomiadeyemi.svg', 'NG', 'motion,kinetic,lagos', 'An original motion-graphics concept celebrating rhythm, movement, and bold shapes.'],
    ['maya', 'A Gallery in Motion', 'Film & Video', '/videos/spektra-motion-study.mp4', 'ID', 'motion,abstract,video,original', 'An original five-second motion study made for SPEKTRA using layered shapes, soft color, and a slow camera move.'],
];
// Karya sejarah dipakai dengan gambar asli jika tersedia; jika tidak, kartu referensi lokal ditampilkan.
const archiveWorks = [
    { title: 'Alice in Wonderland — Frontispiece', category: 'Digital Illustration & Drawing', media: '/images/artworks/archive/digital-illustration/alice-frontispiece.webp', mediaType: 'image', country: 'GB', tags: ['john-tenniel', 'alice-in-wonderland', 'book-illustration', '1866'], description: 'Frontispiece from the 1866 edition of Alice in Wonderland, showing the King and Queen of Hearts seated before their court.', artist: 'John Tenniel', year: '1866', location: 'London, England', medium: 'Book illustration / engraved print', collection: 'Alice’s Adventures in Wonderland, 1866 edition', source: 'https://commons.wikimedia.org/wiki/File:Frontispiece_from_Alice_in_Wonderland_drawn_by_Sir_John_Tenniel.png', license: 'Public Domain Mark (PD-Art)' },
    { title: 'The Raven — Dore Illustration', category: 'Digital Illustration & Drawing', media: '/images/artworks/archive/digital-illustration/dore-raven.webp', mediaType: 'image', country: 'FR', tags: ['gustave-dore', 'edgar-allan-poe', 'the-raven', 'engraving'], description: 'Gustave Doré’s dramatic visual interpretation of Edgar Allan Poe’s poem The Raven.', artist: 'Gustave Doré', year: '1884', location: 'France', medium: 'Book illustration / engraving', collection: 'Illustrations for The Raven', source: 'https://commons.wikimedia.org/wiki/File:Dore_Raven.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'The Mad Hatter', category: 'Digital Illustration & Drawing', media: '/images/artworks/archive/digital-illustration/mad-hatter.webp', mediaType: 'image', country: 'GB', tags: ['john-tenniel', 'alice-in-wonderland', 'character-illustration', '1865'], description: 'John Tenniel’s original illustration of the Hatter, created for Lewis Carroll’s Alice in Wonderland.', artist: 'John Tenniel', year: '1865', location: 'London, England', medium: 'Book illustration / engraving', collection: 'Alice’s Adventures in Wonderland', source: 'https://commons.wikimedia.org/wiki/File:MadlHatterByTenniel.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'Mona Lisa', category: 'Painting & Traditional Art', media: '/images/artworks/archive/painting/mona-lisa.webp', mediaType: 'image', country: 'IT', tags: ['leonardo-da-vinci', 'renaissance', 'portrait', 'louvre'], description: 'One of the best-known portraits in Western art, celebrated for its subtle expression and sfumato technique.', artist: 'Leonardo da Vinci', year: 'c. 1503–1519', location: 'Florence, Italy', medium: 'Oil on poplar panel', collection: 'Musée du Louvre, Paris, France', source: 'https://commons.wikimedia.org/wiki/File:Mona_Lisa.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'Girl with a Pearl Earring', category: 'Painting & Traditional Art', media: '/images/artworks/archive/painting/girl-with-pearl-earring.webp', mediaType: 'image', country: 'NL', tags: ['johannes-vermeer', 'dutch-golden-age', 'portrait', 'mauritshuis'], description: 'A tronie rather than a portrait of a known individual: an imagined young figure in exotic dress, painted with Vermeer’s characteristic attention to soft light and the gleam of a pearl.', artist: 'Johannes Vermeer', year: 'c. 1665', location: 'Delft, Netherlands', medium: 'Oil on canvas', collection: 'Mauritshuis, The Hague, Netherlands', source: 'https://commons.wikimedia.org/wiki/File:Girl_with_a_Pearl_Earring.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'The Great Wave off Kanagawa', category: 'Painting & Traditional Art', media: '/images/artworks/archive/painting/great-wave-off-kanagawa.webp', mediaType: 'image', country: 'JP', tags: ['hokusai', 'ukiyo-e', 'woodblock-print', 'japan'], description: 'An iconic ukiyo-e woodblock print from Hokusai’s Thirty-six Views of Mount Fuji. The cresting wave frames the distant mountain, while indigo and imported Prussian blue shape the dramatic scene.', artist: 'Katsushika Hokusai', year: 'c. 1830–1832', location: 'Edo (present-day Tokyo), Japan', medium: 'Polychrome woodblock print (nishiki-e)', collection: 'Thirty-six Views of Mount Fuji; impressions held in several museum collections', source: 'https://commons.wikimedia.org/wiki/File:The_Great_Wave_off_Kanagawa.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'The Arrest of Pangeran Diponegoro', category: 'Painting & Traditional Art', media: '/images/artworks/archive/painting/arrest-of-diponegoro.webp', mediaType: 'image', country: 'ID', tags: ['raden-saleh', 'diponegoro', 'indonesian-art', 'romanticism'], description: 'Raden Saleh’s 1857 history painting depicts the arrest of Prince Diponegoro in 1830. The work is recognized as a National Cultural Heritage object in Indonesia (SK 306/M/2018).', artist: 'Raden Saleh', year: '1857', location: 'Java, Indonesia', medium: 'Oil on canvas', collection: 'Gedung Agung, Yogyakarta, Indonesia', source: 'https://commons.wikimedia.org/wiki/File:Raden_Saleh_-_Diponegoro_arrest.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'David', category: '3D Art & Sculpture', media: '/images/artworks/archive/3d/david-michelangelo.webp', mediaType: 'image', country: 'IT', tags: ['michelangelo', 'renaissance', 'marble', 'sculpture'], description: 'Michelangelo’s 5.17-metre marble David was made between 1501 and 1504. Commissioned for Florence Cathedral, it became a symbol of the city’s civic identity and Renaissance sculpture.', artist: 'Michelangelo', year: '1501–1504', location: 'Florence, Italy', medium: 'Marble sculpture; photograph by Silvia.calvoc', collection: 'Galleria dell’Accademia, Florence, Italy', source: 'https://commons.wikimedia.org/wiki/File:David,_Michelangelo.jpg', license: 'CC BY-SA 4.0 — photograph by Silvia.calvoc; attribution and share-alike required' },
    { title: 'Bust of Nefertiti', category: '3D Art & Sculpture', media: '/images/artworks/archive/3d/nefertiti-bust.webp', mediaType: 'image', country: 'EG', tags: ['nefertiti', 'ancient-egypt', 'bust', 'sculpture'], description: 'The painted limestone-and-stucco bust of Queen Nefertiti was created in ancient Egypt around 1340 BCE and is now a landmark object in Berlin’s Neues Museum.', artist: 'Ancient Egyptian workshop (artist unknown); photograph by Faust002', year: 'c. 1340 BCE', location: 'Amarna, Ancient Egypt', medium: 'Painted limestone, gypsum, and stucco', collection: 'Neues Museum, Berlin, Germany', source: 'https://commons.wikimedia.org/wiki/File:The_bust_of_Nefertiti_from_the_Egyptian_Museum_of_Berlin_collection_in_the_Neues_Museum.jpg', license: 'CC0 1.0 — photograph dedicated to the public domain by Faust002' },
    { title: 'The Thinker', category: '3D Art & Sculpture', media: '/images/artworks/archive/3d/the-thinker.webp', mediaType: 'image', country: 'FR', tags: ['auguste-rodin', 'bronze', 'sculpture', 'modern-art'], description: 'First conceived around 1880 as The Poet for Rodin’s monumental Gates of Hell, the figure was later exhibited independently and became a universal image of creative thought. Multiple casts exist.', artist: 'Auguste Rodin', year: '1880 (conceived); later casts', location: 'Paris, France', medium: 'Bronze sculpture; photograph by Karora', collection: 'The Thinker, bronze cast', source: 'https://commons.wikimedia.org/wiki/File:The_Thinker,_Auguste_Rodin.jpg', license: 'Public domain photograph / public-domain sculpture' },
    { title: 'Fantasmagorie', category: 'Animation & Motion Graphics', media: '/images/artworks/archive/animation/fantasmagorie-cohl.gif', mediaType: 'image', country: 'FR', tags: ['emile-cohl', 'early-animation', 'hand-drawn', '1908'], description: 'A frame from Émile Cohl’s Fantasmagorie (1908), a landmark in the history of hand-drawn animation. The supplied GIF contains one frame and is displayed as a still.', artist: 'Émile Cohl', year: '1908', location: 'Paris, France', medium: 'Hand-drawn animation frame', collection: 'Fantasmagorie', source: 'https://commons.wikimedia.org/wiki/File:Fantasmagorie_(Cohl).gif', license: 'Public domain; early film artwork' },
    { title: 'Gertie the Dinosaur', category: 'Animation & Motion Graphics', media: '/images/artworks/archive/animation/gertie-the-dinosaur.webp', mediaType: 'image', country: 'US', tags: ['winsor-mccay', 'animation-history', 'character-animation', '1914'], description: 'A still from Winsor McCay’s Gertie the Dinosaur, an influential early animated film known for expressive character performance.', artist: 'Winsor McCay', year: '1914', location: 'United States', medium: 'Animated film still', collection: 'Gertie the Dinosaur', source: 'https://commons.wikimedia.org/wiki/File:Gertie_the_Dinosaur.jpg', license: 'Public domain; early film artwork' },
    { title: 'Zodiac', category: 'Graphic Design & Typography', media: '/images/artworks/archive/graphic-design/mucha-zodiac.webp', mediaType: 'image', country: 'CZ', tags: ['alphonse-mucha', 'art-nouveau', 'poster', 'lithography'], description: 'Alphonse Mucha’s ornate Zodiac design, combining decorative lettering, botanical motifs, and elegant figure drawing.', artist: 'Alphonse Mucha', year: '1896', location: 'Paris, France', medium: 'Color lithograph / decorative poster', collection: 'Zodiac', source: 'https://commons.wikimedia.org/wiki/File:Alphonse_Mucha_-_Zodiac.jpg', license: 'Public domain; artist died in 1939' },
    { title: 'Moulin Rouge — La Goulue', category: 'Graphic Design & Typography', media: '/images/artworks/archive/graphic-design/moulin-rouge-la-goulue.webp', mediaType: 'image', country: 'FR', tags: ['toulouse-lautrec', 'poster-design', 'lithography', 'paris'], description: 'Henri de Toulouse-Lautrec’s iconic poster for the Moulin Rouge, using bold silhouettes and expressive lettering to capture Parisian nightlife.', artist: 'Henri de Toulouse-Lautrec', year: '1891', location: 'Paris, France', medium: 'Color lithograph poster', collection: 'Moulin Rouge poster', source: 'https://commons.wikimedia.org/wiki/File:Moulin_Rouge_%E2%80%93_La_Goulue,_by_Henri_de_Toulouse-Lautrec.jpg', license: 'Public domain; artist died in 1901' },
    { title: 'Le Chat Noir', category: 'Graphic Design & Typography', media: '/images/artworks/archive/graphic-design/le-chat-noir.webp', mediaType: 'image', country: 'FR', tags: ['theophile-steinlen', 'poster', 'cabaret', 'lithography'], description: 'Théophile Steinlen’s famous poster advertising the touring shadow-puppet theatre Le Chat Noir.', artist: 'Théophile-Alexandre Steinlen', year: '1896', location: 'Paris, France', medium: 'Color lithograph poster', collection: 'Van Gogh Museum, Amsterdam, Netherlands', source: 'https://commons.wikimedia.org/wiki/File:Steinlein-chatnoir.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'The Horse in Motion', category: 'Photography', media: '/images/artworks/archive/photography/horse-in-motion.webp', mediaType: 'image', country: 'US', tags: ['eadweard-muybridge', 'motion-study', 'photography-history', '1878'], description: 'Eadweard Muybridge’s sequential study of Sallie Gardner at a gallop, a pioneering experiment in photographic motion analysis.', artist: 'Eadweard Muybridge', year: '19 June 1878', location: 'Palo Alto, California, United States', medium: 'Sequential photographic study / albumen print', collection: 'Library of Congress Prints and Photographs Division', source: 'https://commons.wikimedia.org/wiki/File:The_Horse_in_Motion.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'Migrant Mother', category: 'Photography', media: '/images/artworks/archive/photography/migrant-mother.webp', mediaType: 'image', country: 'US', tags: ['dorothea-lange', 'documentary-photography', 'great-depression', '1936'], description: 'Dorothea Lange’s 1936 documentary portrait of Florence Owens Thompson and her children, made for the Farm Security Administration.', artist: 'Dorothea Lange', year: '1936', location: 'Nipomo, California, United States', medium: 'Black-and-white documentary photograph', collection: 'Library of Congress, Farm Security Administration collection', source: 'https://commons.wikimedia.org/wiki/File:Migrant_Mother_by_Dorothea_Lange_(original).tif', license: 'U.S. federal work — public domain in the United States; check other jurisdictions' },
    { title: 'The Raven — Book Illustration', category: 'Writing & Mixed Media', media: '/images/artworks/archive/writing/the-raven-dore.webp', mediaType: 'image', country: 'FR', tags: ['gustave-dore', 'edgar-allan-poe', 'the-raven', 'book-art'], description: 'An engraved illustration by Gustave Doré created for Edgar Allan Poe’s poem The Raven, pairing literary atmosphere with dramatic visual storytelling.', artist: 'Gustave Doré (after Edgar Allan Poe)', year: '1884', location: 'France', medium: 'Book illustration / engraving', collection: 'The Raven illustrated edition', source: 'https://commons.wikimedia.org/wiki/File:Paul_Gustave_Dore_Raven10.jpg', license: 'Public Domain Mark (PD-Art)' },
    { title: 'Pride and Prejudice — First Edition Title Page', category: 'Writing & Mixed Media', media: '/images/artworks/archive/writing/pride-and-prejudice-title-page.webp', mediaType: 'image', country: 'GB', tags: ['jane-austen', 'pride-and-prejudice', 'book-history', '1813'], description: 'The title page from the first edition of Jane Austen’s Pride and Prejudice, published in London in 1813.', artist: 'Jane Austen', year: '1813', location: 'London, England', medium: 'Printed book title page', collection: 'Lilly Library, Indiana University', source: 'https://commons.wikimedia.org/wiki/File:PrideAndPrejudiceTitlePage.jpg', license: 'Public domain; author died in 1817' },
    { title: 'Alice’s Adventures in Wonderland — 1865 Cover', category: 'Writing & Mixed Media', media: '/images/artworks/archive/writing/alice-adventures-cover.webp', mediaType: 'image', country: 'GB', tags: ['lewis-carroll', 'alice-in-wonderland', 'book-cover', '1865'], description: 'The cover of the 1865 first edition of Lewis Carroll’s Alice’s Adventures in Wonderland.', artist: 'Lewis Carroll', year: '26 November 1865', location: 'England', medium: 'Printed book cover', collection: 'Alice’s Adventures in Wonderland, first edition', source: 'https://commons.wikimedia.org/wiki/File:Alice%27s_Adventures_in_Wonderland_cover_(1865).jpg', license: 'Public domain; author died in 1898' },
    { title: 'Bach — Cello Suite No. 1: Prelude', category: 'Music & Sound', media: '/audio/music/bach-cello-suite-1-prelude.ogg', mediaType: 'audio', country: 'DE', tags: ['johann-sebastian-bach', 'classical-music', 'cello', 'prelude'], description: 'A performance of the Prelude from Johann Sebastian Bach’s Cello Suite No. 1 in G major (BWV 1007). The composition is public domain; this recording is separately licensed.', artist: 'Johann Sebastian Bach; performance by Fopseh', year: 'c. 1720 (composition); recording 21 December 2024', location: 'Germany (composer origin)', medium: 'Solo cello recording, Ogg Vorbis', collection: 'Cello Suite No. 1 in G major, BWV 1007', source: 'https://commons.wikimedia.org/wiki/File:Bach_Cello_Suite_1_Prelude_(BWV_1007)_Played_by_Chris.ogg', license: 'CC0 1.0 for the recording; Bach composition is public domain' },
    { title: 'Mozart — Eine kleine Nachtmusik: Allegro', category: 'Music & Sound', media: '/audio/music/mozart-eine-kleine-nachtmusik.ogg', mediaType: 'audio', country: 'AT', tags: ['wolfgang-amadeus-mozart', 'classical-music', 'orchestra', 'serenade'], description: 'The first movement of Mozart’s Eine kleine Nachtmusik, performed by the Advent Chamber Orchestra. The composition is public domain; the recording is CC BY-SA 2.0.', artist: 'Wolfgang Amadeus Mozart; Advent Chamber Orchestra', year: '1787 (composition); 2005–2006 (recording)', location: 'Salzburg / Vienna, Austria (composer origin)', medium: 'Orchestral recording, Ogg Vorbis', collection: 'Advent Chamber Orchestra season 2005–2006', source: 'https://commons.wikimedia.org/wiki/File:Mozart_-_Eine_kleine_Nachtmusik_-_1._Allegro.ogg', license: 'CC BY-SA 2.0 — performance by Advent Chamber Orchestra; attribution and share-alike required' },
    { title: 'A Trip to the Moon — Film Excerpt', category: 'Film & Video', media: '/videos/a-trip-to-the-moon-excerpt.mp4', mediaType: 'video', country: 'FR', tags: ['georges-melies', 'silent-film', 'science-fiction', '1902'], description: 'A short excerpt from Georges Méliès’ 1902 silent fantasy film, a landmark in early cinema. This supplied MP4 is a brief clip, not the full film.', artist: 'Georges Méliès', year: '1902', location: 'France', medium: 'Silent film excerpt, MP4', collection: 'Le Voyage dans la Lune / A Trip to the Moon', source: 'https://commons.wikimedia.org/wiki/File:Le_Voyage_Dans_La_Lune.ogv', license: 'Original film is public domain; exact source transfer of supplied MP4 has not been independently verified' },
    { title: 'Nosferatu — Film Excerpt', category: 'Film & Video', media: '/videos/nosferatu-excerpt.mp4', mediaType: 'video', country: 'DE', tags: ['f-w-murnau', 'silent-horror', 'expressionism', '1922'], description: 'A short excerpt from F. W. Murnau’s 1922 silent horror film Nosferatu. This supplied MP4 is a brief clip, not the full film.', artist: 'F. W. Murnau', year: '1922', location: 'Germany', medium: 'Silent film excerpt, MP4', collection: 'Nosferatu', source: 'https://commons.wikimedia.org/wiki/File:Nosferatu_(1922).webm', license: 'Original film is public domain; exact source transfer of supplied MP4 has not been independently verified' },
];
// KARYA ORISINAL SPEKTRA: satu karya UI/UX dibuat khusus untuk melengkapi kategori yang tidak memiliki karya arsip.
const categoryShowcaseWorks = [
    { title: 'A Kinder Interface', category: 'UI/UX & Product Design', media: '/images/artworks/originals/a-kinder-interface.svg', description: 'An original human-centered interface concept for a welcoming community art platform, with clear hierarchy and accessible navigation.', tags: ['ui-ux', 'human-centered-design', 'mobile-app', 'original'], artist: 'SPEKTRA Studio', year: '2026', location: 'Indonesia', medium: 'Original vector interface study (SVG)', collection: 'SPEKTRA Original Works', license: 'Original artwork created for the SPEKTRA project' },
];
try {
    activeClient = await pool.connect();
    await activeClient.query('BEGIN');
    const hashed = await bcrypt.hash('Demo12345!', 12);
    const users = {};
    for (const [name, handle, email, role, status, reason, country] of people) {
        await sql(`INSERT INTO users(name,handle,email,password_hash,role,curator_status,rejection_reason,bio,country_code)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(handle) DO NOTHING`, [name, handle, email, hashed, role, status, reason, handle === 'spektraarchive' ? 'A curated historical art collection with credits to original creators.' : role === 'member' ? `Fictional sample creator from ${country}. Exploring art in every form.` : 'Creative minds building a world without borders.', country]);
        const { rows } = await sql('SELECT id FROM users WHERE handle=$1', [handle]);
        users[handle] = rows[0].id;
    }
    // Museum archive is a Member (not a Curator) because only Members may publish artworks.
    await sql("UPDATE users SET role='member', curator_status=NULL, rejection_reason=NULL, country_code='OTHER' WHERE handle='spektraarchive' AND role='curator'");
    // Remove only obsolete demo seed rows from earlier SPEKTRA versions.
    // User-created artworks in other accounts are never touched.
    const retiredDemoWorks = [
        ['akari', 'Floating Gardens'], ['noor', 'Midnight Cairo'], ['akari', 'Whale Song'], ['akari', 'Paper Planet'],
        ['denizkaya', 'Bosphorus Shapes'], ['valeriacruz', 'Papel Stories'], ['milaschneider', 'Bauhaus in Bloom'], ['isabelrojas', 'Desert Sequence'],
        ['spektraarchive', 'Vitruvian Man'], ['spektraarchive', 'The Starry Night'], ['spektraarchive', 'The Great Wave'], ['spektraarchive', 'A Study in Framed Light'], ['spektraarchive', 'The Shape of a Message'],
        ['spektraarchive', 'Soft Geometry No. 01'], ['spektraarchive', 'The In-Between Frames'], ['spektraarchive', 'Frames Before the Story'],
        ['spektraarchive', 'A Room Made of Sound'], ['spektraarchive', 'A Page for the Unsaid'],
        ['maya', 'The Shape of Wonder'], ['maya', 'Soul of Color'], ['akari', 'Neon Shibuya'],
        ['luca', 'La Dolce Geometria'], ['luca', 'Postcards from Tomorrow'], ['noor', 'Desert Frequency'],
        ['maya', 'Bloom in Motion'], ['luca', 'Golden Hour Studio'], ['noor', 'The Other Side of Sound'],
        ['maya', 'Frames of Tomorrow'], ['maya', 'A Gallery in Motion'], ['akari', 'Words in Orbit'],
        ['jieunpark', 'Soft Seoul Interface'], ['eloisemartin', 'Northern Storyboards'],
        ['zoewhitfield', 'Coastal Light'], ['oliverreed', 'After the Rain'], ['chloemoreau', 'Atelier Interface'],
        ['leratomokoena', 'Moving Horizons'], ['jordanellis', 'Blue-hour Frequencies'],
        ['spektraarchive', 'Midnight Carnival'], ['spektraarchive', 'SPEKTRA Studio Atlas']
    ];
    for (const [handle, title] of retiredDemoWorks) {
        await sql(
            `DELETE FROM artworks a USING users u
             WHERE a.user_id=u.id AND u.handle=$1 AND a.title=$2`,
            [handle, title],
        );
    }
    const { rows: catRows } = await sql('SELECT id,name FROM categories');
    const categories = Object.fromEntries(catRows.map((category) => [category.name, category.id]));
    for (const [, , category] of works)
        if (!categories[category])
            throw new Error(`Kategori karya tidak ditemukan: ${category}`);
    for (const work of archiveWorks)
        if (!categories[work.category])
            throw new Error(`Kategori arsip tidak ditemukan: ${work.category}`);
    for (const work of categoryShowcaseWorks)
        if (!categories[work.category])
            throw new Error(`Kategori showcase tidak ditemukan: ${work.category}`);
    // Seed is repeatable: demo rows are updated in place; user content is preserved.
    const artIds = [];
    for (const [handle, title, category, media, country, tagString, description] of works) {
        const type = media.startsWith('/audio/') ? 'audio' : media.startsWith('/videos/') ? 'video' : 'image';
        const existing = await sql('SELECT id FROM artworks WHERE user_id=$1 AND title=$2 LIMIT 1', [users[handle], title]);
        if (existing.rows[0]) {
            await sql(`UPDATE artworks SET category_id=$1,description=$2,media_url=$3,media_type=$4,country_code=$5,tags=$6,removed_at=NULL
        WHERE id=$7`, [categories[category], description, media, type, country, tagString.split(','), existing.rows[0].id]);
            artIds.push(existing.rows[0].id);
        }
        else {
            const { rows } = await sql(`INSERT INTO artworks(user_id,category_id,title,description,media_url,media_type,country_code,tags)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, [users[handle], categories[category], title, description, media, type, country, tagString.split(',')]);
            if (rows[0])
                artIds.push(rows[0].id);
        }
    }
    for (const work of archiveWorks) {
        const localPath = join(projectRoot, 'public', work.media.replace(/^\//, ''));
        if (!existsSync(localPath))
            throw new Error(`Aset arsip tidak ditemukan: ${work.media}`);
        const existing = await sql('SELECT id FROM artworks WHERE user_id=$1 AND title=$2 LIMIT 1', [users.spektraarchive, work.title]);
        const values = [categories[work.category], work.description, work.media, work.mediaType, work.country, work.tags, work.artist, work.year, work.location, work.medium, work.collection, work.source, work.license];
        if (existing.rows[0]) {
            await sql(`UPDATE artworks SET category_id=$1,description=$2,media_url=$3,media_type=$4,country_code=$5,tags=$6,
        original_artist=$7,creation_year=$8,creation_location=$9,medium=$10,collection_name=$11,source_url=$12,license_label=$13,removed_at=NULL
        WHERE id=$14`, [...values, existing.rows[0].id]);
            artIds.push(existing.rows[0].id);
        }
        else {
            const { rows } = await sql(`INSERT INTO artworks(user_id,category_id,title,description,media_url,media_type,country_code,tags,original_artist,creation_year,creation_location,medium,collection_name,source_url,license_label)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`, [users.spektraarchive, categories[work.category], work.title, work.description, work.media, work.mediaType, work.country, work.tags, work.artist, work.year, work.location, work.medium, work.collection, work.source, work.license]);
            if (rows[0])
                artIds.push(rows[0].id);
        }
    }
    for (const work of categoryShowcaseWorks) {
        const localPath = join(projectRoot, 'public', work.media.replace(/^\//, ''));
        if (!existsSync(localPath))
            throw new Error(`Karya orisinal tidak ditemukan: ${work.media}`);
        const existing = await sql('SELECT id FROM artworks WHERE user_id=$1 AND title=$2 LIMIT 1', [users.spektraarchive, work.title]);
        const values = [categories[work.category], work.description, work.media, work.tags, work.artist, work.year, work.location, work.medium, work.collection, work.license];
        if (existing.rows[0]) {
            await sql(`UPDATE artworks SET category_id=$1,description=$2,media_url=$3,media_type='image',country_code='ID',tags=$4,
        original_artist=$5,creation_year=$6,creation_location=$7,medium=$8,collection_name=$9,license_label=$10,removed_at=NULL
        WHERE id=$11`, [...values, existing.rows[0].id]);
            artIds.push(existing.rows[0].id);
        }
        else {
            const { rows } = await sql(`INSERT INTO artworks(user_id,category_id,title,description,media_url,media_type,country_code,tags,original_artist,creation_year,creation_location,medium,collection_name,license_label)
        VALUES($1,$2,$3,$4,$5,'image','ID',$6,$7,$8,$9,$10,$11,$12) RETURNING id`, [users.spektraarchive, categories[work.category], work.title, work.description, work.media, work.tags, work.artist, work.year, work.location, work.medium, work.collection, work.license]);
            if (rows[0])
                artIds.push(rows[0].id);
        }
    }
    const members = ['maya', 'akari', 'luca', 'noor', 'camilarocha', 'aaravmehta', 'salmaidrissi', 'tomiadeyemi', 'spektraarchive'];
    for (let i = 0; i < artIds.length; i++) {
        for (let j = 0; j < Math.min(5, members.length); j++)
            if ((i + j) % 4 !== 0)
                await sql('INSERT INTO likes(user_id,artwork_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [users[members[j]], artIds[i]]);
        await sql('INSERT INTO favorites(user_id,artwork_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [users[members[(i + 1) % members.length]], artIds[i]]);
    }
    await sql(`INSERT INTO comments(user_id,artwork_id,body)
  SELECT $1,$2,$3 WHERE NOT EXISTS(SELECT 1 FROM comments WHERE user_id=$1 AND artwork_id=$2 AND body=$3)`, [users.luca, artIds[0], 'This color palette is pure magic!']);
    await sql(`INSERT INTO comments(user_id,artwork_id,body)
  SELECT $1,$2,$3 WHERE NOT EXISTS(SELECT 1 FROM comments WHERE user_id=$1 AND artwork_id=$2 AND body=$3)`, [users.akari, artIds[2], 'Love the dreamlike atmosphere.']);
    await sql('INSERT INTO follows(follower_id,creator_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [users.luca, users.maya]);
    await sql('INSERT INTO follows(follower_id,creator_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [users.maya, users.akari]);
    const now = Date.now();
    const days = n => new Date(now + n * 86400000).toISOString();
    const events = [
        ['A World in Colors', 'Illustrate the emotions of a world without borders. Celebrate different traditions, dreams, and identities.', 'Submit only your original artwork. Respect other creators. One submission per Member.', 'Featured winner gallery + digital certificate', days(-5), days(10), '/images/banners/world-in-colors.svg'],
        ['Beyond Reality', 'Create something surreal that challenges the boundaries of what is possible.', 'Any original artwork category. One entry per person. Safe content only.', 'Creator spotlight + online exhibition', days(-18), days(-2), '/images/banners/beyond-reality.svg'],
        ['Sound of Tomorrow', 'Imagine how the future might sound or look. Music, visuals and storytelling are welcome.', 'Original work only. One piece per participant.', 'International creator feature', days(4), days(20), '/images/banners/sound-tomorrow.svg'],
    ];
    const eventIds = [];
    for (const [title, description, rules, prize, start, end, banner] of events) {
        await sql(`INSERT INTO challenges(curator_id,title,description,rules,prize,start_at,end_at,banner_url)
   SELECT $1,$2,$3,$4,$5,$6,$7,$8 WHERE NOT EXISTS(SELECT 1 FROM challenges WHERE curator_id=$1 AND title=$2)`, [users.solstice, title, description, rules, prize, start, end, banner]);
        const { rows } = await sql('SELECT id FROM challenges WHERE title=$1 AND curator_id=$2', [title, users.solstice]);
        eventIds.push(rows[0].id);
    }
    for (const [eventIndex, ai, member, winner] of [[0, 0, 'maya', null], [0, 2, 'akari', null], [0, 4, 'luca', null], [1, 1, 'maya', 1], [1, 3, 'akari', 2], [1, 7, 'noor', 3]]) {
        const cid = eventIds[eventIndex];
        await sql(`INSERT INTO submissions(challenge_id,user_id,artwork_id,winner_rank)
    VALUES($1,$2,$3,$4) ON CONFLICT(challenge_id,user_id) DO NOTHING`, [cid, users[member], artIds[ai], winner]);
    }
    await sql(`INSERT INTO artwork_reports(user_id,artwork_id,reason,detail) VALUES($1,$2,$3,$4)
 ON CONFLICT(user_id,artwork_id) DO NOTHING`, [users.luca, artIds[2], 'Plagiarism', 'Example report for moderation demo.']);
    const { rows: comments } = await sql('SELECT id FROM comments WHERE artwork_id=$1 AND user_id=$2 ORDER BY id LIMIT 1', [artIds[0], users.luca]);
    if (comments.length)
        await sql('INSERT INTO comment_reports(user_id,comment_id,reason) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [users.noor, comments[0].id, 'Spam / inappropriate language']);
    console.log(`Seed berhasil: ${people.length} akun demo, ${archiveWorks.length} karya dari paket imagesforspektra, ${works.length + categoryShowcaseWorks.length} karya orisinal, 30 karya total, 10 kategori, 3 challenge, interaksi, submisi, dan data moderasi.`);
    console.log('Demo password for every account: Demo12345! (CHANGE BEFORE DEPLOYMENT)');
    console.log('Akun uji: admin@spektra.test, maya@spektra.test, solstice@spektra.test, museum@spektra.test, society@spektra.test.');
    await activeClient.query('COMMIT');
}
catch (e) {
    if (activeClient) {
        try { await activeClient.query('ROLLBACK'); } catch { /* pertahankan error awal */ }
    }
    console.error('Seed gagal dan perubahan dibatalkan:', e);
    process.exitCode = 1;
}
finally {
    activeClient?.release();
    await pool.end();
}

