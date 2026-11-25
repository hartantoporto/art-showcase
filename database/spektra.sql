-- SPEKTRA / Struktur PostgreSQL. Buat database bernama spektra_db terlebih dahulu melalui pgAdmin.
BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(90) NOT NULL,
  handle VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(12) NOT NULL CHECK (role IN ('admin','member','curator')),
  curator_status VARCHAR(12) CHECK (curator_status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  avatar_url TEXT,
  bio VARCHAR(500),
  country_code VARCHAR(5),
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT curator_status_valid CHECK ((role = 'curator' AND curator_status IS NOT NULL) OR (role <> 'curator' AND curator_status IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (LOWER(email));

ALTER TABLE users ADD COLUMN IF NOT EXISTS curator_status VARCHAR(12);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code VARCHAR(5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url TEXT;
CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(70) NOT NULL,
  slug VARCHAR(90) NOT NULL UNIQUE,
  icon VARCHAR(10) NOT NULL DEFAULT '✦',
  color VARCHAR(15) NOT NULL DEFAULT '#A68AFF',
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '/categories/default.svg'
);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cover_url TEXT NOT NULL DEFAULT '/categories/default.svg';
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_lower_uq ON categories(LOWER(name));
CREATE TABLE IF NOT EXISTS artworks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title VARCHAR(130) NOT NULL,
  description TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(12) NOT NULL CHECK (media_type IN ('image','audio','video','document')),
  original_filename TEXT,
  country_code VARCHAR(5) NOT NULL,
  tags TEXT[] NOT NULL,
  original_artist VARCHAR(180),
  creation_year VARCHAR(120),
  creation_location VARCHAR(180),
  medium VARCHAR(180),
  collection_name VARCHAR(180),
  source_url TEXT,
  license_label VARCHAR(120),
  removed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT artwork_has_tag CHECK (array_length(tags,1) >= 1)
);
-- MIGRASI KARYA: lengkapi kolom yang mungkin belum ada 
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS original_filename TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS media_type VARCHAR(12) NOT NULL DEFAULT 'image';
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS country_code VARCHAR(5);
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE artworks ADD COLUMN IF NOT EXISTS original_artist TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS creation_year TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS creation_location TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS medium TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS collection_name TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS license_label TEXT;
ALTER TABLE artworks ALTER COLUMN title TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN media_url TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN original_artist TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN creation_year TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN creation_location TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN medium TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN collection_name TYPE TEXT;
ALTER TABLE artworks ALTER COLUMN license_label TYPE TEXT;

CREATE INDEX IF NOT EXISTS artwork_created_idx ON artworks (created_at DESC) WHERE removed_at IS NULL;
CREATE INDEX IF NOT EXISTS artwork_country_idx ON artworks (country_code) WHERE removed_at IS NULL;
CREATE TABLE IF NOT EXISTS likes (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id BIGINT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id,artwork_id)
);
CREATE TABLE IF NOT EXISTS favorites (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id BIGINT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id,artwork_id)
);
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id BIGINT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  body VARCHAR(1200) NOT NULL,
  removed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS artwork_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id BIGINT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  reason VARCHAR(80) NOT NULL,
  detail VARCHAR(500),
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dismissed','taken_down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id,artwork_id)
);
ALTER TABLE artwork_reports ADD COLUMN IF NOT EXISTS detail VARCHAR(500);
ALTER TABLE artwork_reports ADD COLUMN IF NOT EXISTS status VARCHAR(15) NOT NULL DEFAULT 'pending';
CREATE TABLE IF NOT EXISTS challenges (
  id BIGSERIAL PRIMARY KEY,
  curator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(130) NOT NULL,
  description TEXT NOT NULL,
  rules TEXT NOT NULL,
  prize VARCHAR(200) NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  banner_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_challenge_dates CHECK (end_at > start_at)
);
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id BIGINT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  winner_rank SMALLINT CHECK (winner_rank BETWEEN 1 AND 3),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(challenge_id,user_id),
  UNIQUE(challenge_id,artwork_id)
);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS winner_rank SMALLINT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS submissions_one_winner_per_rank ON submissions (challenge_id,winner_rank) WHERE winner_rank IS NOT NULL;
-- Optional upgrades
CREATE TABLE IF NOT EXISTS follows (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY(follower_id,creator_id),
  CHECK(follower_id <> creator_id)
);
CREATE TABLE IF NOT EXISTS collections (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(300) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id BIGINT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  artwork_id BIGINT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  PRIMARY KEY(collection_id,artwork_id)
);
CREATE TABLE IF NOT EXISTS comment_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reason VARCHAR(80) NOT NULL,
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dismissed','taken_down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id,comment_id)
);

-- Progres petualangan tersimpan per akun; tiket emas membuka akses ke galeri bonus.
CREATE TABLE IF NOT EXISTS game_progress (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  found_tickets TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  completed_levels SMALLINT[] NOT NULL DEFAULT ARRAY[]::SMALLINT[],
  unlocked_level SMALLINT NOT NULL DEFAULT 0 CHECK (unlocked_level BETWEEN 0 AND 5),
  gold_tickets SMALLINT NOT NULL DEFAULT 0 CHECK (gold_tickets BETWEEN 0 AND 3),
  golden_gallery_pass BOOLEAN NOT NULL DEFAULT FALSE,
  aurora_badge_earned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- MIGRASI PROGRES GAME: lengkapi kolom hadiah dan level pada database
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS found_tickets TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS completed_levels SMALLINT[] NOT NULL DEFAULT ARRAY[]::SMALLINT[];
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS unlocked_level SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS gold_tickets SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS golden_gallery_pass BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS aurora_badge_earned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE game_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- SPEKTRA: 10 kategori awal yang ringkas. Admin tetap dapat menambah kategori melalui CRUD.
INSERT INTO categories(name,slug,icon,color,description,cover_url) VALUES
('Digital Illustration & Drawing','digital-illustration','✧','#B9D8CD','Ilustrasi digital, gambar manual, character design, concept art, komik, dan eksplorasi visual.','/images/categories/digital-illustration.svg'),
('Photography','photography','◈','#B7D5DC','Karya fotografi, dokumentasi visual, portrait, produk, perjalanan, dan eksperimentasi cahaya.','/images/categories/photography.svg'),
('Painting & Traditional Art','painting-traditional','✿','#E6C5A4','Lukisan, seni tradisi, printmaking, batik, kerajinan, dan karya berbasis teknik manual.','/images/categories/painting-traditional.svg'),
('Graphic Design & Typography','graphic-design','◆','#C6D9E7','Desain grafis, poster, branding, layout, ilustrasi editorial, tipografi, dan lettering.','/images/categories/graphic-design.svg'),
('UI/UX & Product Design','ui-ux-product-design','▣','#C4D9C8','Desain antarmuka, pengalaman pengguna, produk digital, desain produk, arsitektur, dan creative coding.','/images/categories/ui-ux-product-design.svg'),
('3D Art & Sculpture','3d-art-sculpture','⬡','#E8B8A5','Seni 3D, pemodelan, sculpting digital, patung, instalasi, dan eksplorasi bentuk tiga dimensi.','/images/categories/3d-art-sculpture.svg'),
('Animation & Motion Graphics','animation-motion','✦','#E5D6AD','Animasi 2D/3D, motion graphics, visual effects, game art, dan karya berbasis gerak.','/images/categories/animation-motion.svg'),
('Film & Video','film-video','▶','#BBD6DF','Film pendek, video eksperimental, dokumenter, storyboard, sinematografi, dan video art.','/images/categories/film-video.svg'),
('Music & Sound','music-sound','♫','#E9BDBD','Musik original, komposisi, sound design, podcast, spoken word, dan eksperimen audio.','/images/categories/music-sound.svg'),
('Writing & Mixed Media','writing-mixed-media','❦','#D8D8BA','Puisi, sastra, storytelling, kolase, mixed media, fashion concept, dan karya lintas medium.','/images/categories/writing-mixed-media.svg')
ON CONFLICT(slug) DO UPDATE SET
 name=EXCLUDED.name, icon=EXCLUDED.icon, color=EXCLUDED.color,
 description=EXCLUDED.description, cover_url=EXCLUDED.cover_url;

-- Migrasi aman untuk database versi 28 kategori: karya lama dipindahkan sebelum kategori lama dihapus.
UPDATE artworks a SET category_id=target.id
FROM categories old
JOIN (VALUES
 ('painting','painting-traditional'),('traditional-art','painting-traditional'),('printmaking','painting-traditional'),
 ('drawing-sketching','digital-illustration'),('character-design','digital-illustration'),('concept-art','digital-illustration'),
 ('typography-lettering','graphic-design'),('ui-ux-design','ui-ux-product-design'),('product-design','ui-ux-product-design'),
 ('architecture-spaces','ui-ux-product-design'),('creative-coding','ui-ux-product-design'),('3d-sculpture','3d-art-sculpture'),
 ('animation','animation-motion'),('motion-graphics','animation-motion'),('game-art','animation-motion'),('dance-performance','animation-motion'),
 ('sound-design','music-sound'),('podcast-spoken-word','music-sound'),('poetry-literature','writing-mixed-media'),
 ('mixed-media','writing-mixed-media'),('comics-sequential-art','writing-mixed-media'),('craft-handmade','writing-mixed-media'),
 ('fashion-design','writing-mixed-media')
) AS mapping(old_slug,new_slug) ON old.slug=mapping.old_slug
JOIN categories target ON target.slug=mapping.new_slug
WHERE a.category_id=old.id;

DELETE FROM categories WHERE slug IN (
 'painting','traditional-art','printmaking','drawing-sketching','character-design','concept-art',
 'typography-lettering','ui-ux-design','product-design','architecture-spaces','creative-coding','3d-sculpture',
 'animation','motion-graphics','game-art','dance-performance','sound-design','podcast-spoken-word',
 'poetry-literature','mixed-media','comics-sequential-art','craft-handmade','fashion-design'
);

COMMIT;
