import Link from 'next/link';
import { existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { ArrowUpRight, Compass, Globe2, Sparkles, Trophy, Music2, Palette, Star } from 'lucide-react';
import ArtworkGrid from '@/components/ArtworkGrid';
import CircusCurtain from '@/components/CircusCurtain';
import CircusCarousel from '@/components/CircusCarousel';
import ChallengeCard from '@/components/ChallengeCard';
import { currentUser } from '@/lib/auth';
import { getCategories, listArtworks, listChallenges } from '@/lib/data';
import { query } from '@/lib/db';
import { countryFlag, countryName } from '@/lib/countries';
import { CATEGORY_GROUPS } from '@/lib/category-groups';

function hasLocalMediaFile(artwork) {
  const mediaUrl = String(artwork?.media_url || '');
  if (!mediaUrl.startsWith('/')) return false;
  const publicRoot = resolve(process.cwd(), 'public');
  const filePath = resolve(publicRoot, mediaUrl.replace(/^\/+/, ''));
  if (!filePath.startsWith(publicRoot + sep)) return false;
  return existsSync(filePath);
}
export const dynamic = 'force-dynamic';
export default async function Home() {
    const user = await currentUser();
    const [categories, trending, latest, challenges, stats, origins, spotlight, archiveImages, videoWorks, audioWorks] = await Promise.all([
        getCategories(),
        listArtworks({ sort: 'popular', limit: 8, userId: user?.id }),
        listArtworks({ sort: 'latest', limit: 4, userId: user?.id }),
        listChallenges({ active: true, limit: 3 }),
        query(`SELECT
      (SELECT COUNT(*)::int FROM artworks WHERE removed_at IS NULL) artworks,
      (SELECT COUNT(*)::int FROM users WHERE role='member') artists,
      (SELECT COUNT(*)::int FROM challenges) challenges,
      (SELECT COUNT(DISTINCT country_code)::int FROM artworks WHERE removed_at IS NULL AND country_code<>'OTHER') countries`),
        query(`SELECT country_code, COUNT(*)::int artwork_count
      FROM artworks WHERE removed_at IS NULL AND country_code<>'OTHER'
      GROUP BY country_code ORDER BY artwork_count DESC, country_code ASC LIMIT 8`),
        query(`SELECT u.id,u.name,u.handle,u.country_code,u.avatar_url,u.bio,
      COUNT(DISTINCT a.id)::int artwork_count,COUNT(l.user_id)::int total_likes
      FROM users u JOIN artworks a ON a.user_id=u.id AND a.removed_at IS NULL
      LEFT JOIN likes l ON l.artwork_id=a.id
      WHERE u.role='member' GROUP BY u.id
      ORDER BY total_likes DESC,artwork_count DESC,u.name ASC LIMIT 4`),
        listArtworks({ sort: 'popular', limit: 100, media: 'image', userId: user?.id }),
        listArtworks({ sort: 'popular', limit: 100, media: 'video', userId: user?.id }),
        listArtworks({ sort: 'popular', limit: 100, media: 'audio', userId: user?.id }),
    ]);
    // FITUR CAROUSEL: 20 gambar arsip dari database diprioritaskan dan file lokalnya diverifikasi.
    const carouselWorks = archiveImages
        .filter((art) => art.creator_handle === 'spektraarchive' && String(art.media_url).includes('/archive/') && art.media_available !== false && hasLocalMediaFile(art))
        .slice(0, 20);
    // FITUR VIDEO DAN AUDIO: hanya media yang file lokalnya tersedia yang ditampilkan.
    const featuredVideos = videoWorks.filter((art) => art.media_available !== false && hasLocalMediaFile(art)).slice(0, 3);
    const featuredAudio = audioWorks.filter((art) => art.media_available !== false && hasLocalMediaFile(art)).slice(0, 3);
    // STATISTIK: angka ringkasan homepage berasal dari agregasi tabel PostgreSQL.
    const totals = stats.rows[0];
    const categoryGroups = CATEGORY_GROUPS.map((group) => ({
        ...group,
        categories: group.slugs.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean),
    }));
    const groupedSlugs = new Set(CATEGORY_GROUPS.flatMap((group) => group.slugs));
    const ungroupedCategories = categories.filter((category) => !groupedSlugs.has(category.slug));
    if (ungroupedCategories.length)
        categoryGroups.push({ title: 'More Disciplines', eyebrow: '04 / COMMUNITY ADDED', description: 'Additional creative disciplines added by the SPEKTRA community.', categories: ungroupedCategories });
    return (<main className="home-page circus-home">
      <CircusCurtain />
      <div className="container-page circus-top-billboard"><span>✷ ✷ ✷</span><p>THE WORLD IS OUR STAGE · EVERY ARTWORK IS A WONDER</p><span>✷ ✷ ✷</span></div>
      <section className="container-page hero-section circus-hero-frame">
        <div className="circus-hero-canopy" aria-hidden="true"><span>✦</span> THE GRAND ART CIRCUS <span>✦</span></div>
        <div className="hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="hero-kicker-star">✦</span> A GLOBAL GALLERY, A LITTLE BIT OF MAGIC</div>
            <h1 className="hero-title">Step into the <span>circus of art.</span><br />Every work is a wonder.</h1>
            <p className="hero-description">Come for the spectacle, stay for the stories. Discover art, music, film, and new worlds from talented makers around the globe.</p>
            <div className="hero-actions">
              <Link className="pill pill-primary" href="/explore">Explore the gallery <ArrowUpRight size={16}/></Link>
              <Link className="pill pill-secondary" href="/art-games">Play art games 🎟️</Link>
            </div>
            <div className="hero-community">
              <div className="hero-avatar-stack" aria-hidden="true"><span>M</span><span>A</span><span>L</span><span>N</span></div>
              <span>For creators, collectors & curious minds everywhere.</span>
            </div>
            <div className="hero-stat">
              <div><strong>{totals.artworks}+</strong><p>Artworks</p></div>
              <div><strong>{totals.artists}+</strong><p>Creators</p></div>
              <div><strong>{totals.countries}+</strong><p>Countries</p></div>
            </div>
          </div>

          <div className="hero-art" aria-label="Milo, the SPEKTRA creative companion">
            <div className="hero-ambient hero-ambient-one"/>
            <div className="hero-ambient hero-ambient-two"/>
            <div className="hero-orbit hero-orbit-one"/>
            <div className="hero-orbit hero-orbit-two"/>
            <div className="hero-floating-card hero-card-left">
              <img src="/images/artworks/originals/midnight-carnival.svg" alt="Midnight Carnival original SPEKTRA artwork"/>
              <div><span>01 / ORIGINAL ART</span><strong>Midnight Carnival</strong></div>
            </div>
            <div className="hero-floating-card hero-card-right">
              <div className="hero-audio-icon"><Music2 size={18}/></div>
              <div className="hero-wave" aria-hidden="true">{Array.from({ length: 13 }, (_, i) => <i key={i}/>)}</div>
              <div><span>02 / SOUND</span><strong>Feel the rhythm</strong></div>
            </div>
            <img className="hero-mascot" src="/images/mascot/spektra-mascot.png" alt="Milo, a cheerful star-shaped creative companion"/>
            <div className="milo-speech"><span className="speech-sparkle">✦</span><div><strong>Hey, dreamer!</strong><small>Ready to find your next favorite?</small></div></div>
            <span className="hero-floating-star hero-star-one">✦</span>
            <span className="hero-floating-star hero-star-two">✧</span>
            <span className="hero-floating-star hero-star-three">✳</span>
          </div>
        </div>
      </section>

      <section className="container-page home-search-wrap">
        <form action="/search" method="get" className="home-search panel">
          <div className="home-search-icon"><Compass size={19}/></div>
          <input name="q" required placeholder="Search artworks, creators, sounds, and stories..." aria-label="Search artworks, creators and challenges"/>
          <button className="pill pill-primary" type="submit">Explore <ArrowUpRight size={15}/></button>
        </form>
      </section>

      <div className="home-marquee circus-festival-marquee" aria-hidden="true"><div className="home-marquee-track">{Array.from({ length: 2 }, (_, i) => <span key={i}>WELCOME <b>✦</b> IMAGINE <b>✦</b> CREATE <b>✦</b> DISCOVER <b>✦</b> CELEBRATE <b>✦</b> PLAY <b>✦</b> ART <b>✦</b></span>)}</div></div>

      {/* FITUR CAROUSEL: 20 gambar arsip terbaik dari database berpindah otomatis setiap dua detik. */}
      {/* FITUR CAROUSEL: perpindahan otomatis dua detik dengan sorotan pada kartu tengah. */}
      <section className="container-page circus-feature-section" aria-labelledby="circus-feature-title">
        <div className="circus-feature-head"><div className="eyebrow">✦ FRONT ROW SEATS ✦</div><h2 id="circus-feature-title">The moving <em>masterpiece</em> parade.</h2><p>Our favorite discoveries travel around the stage. Take a closer look, or choose the next work yourself.</p></div>
        <CircusCarousel artworks={carouselWorks}/>
        <div className="circus-feature-bottom"><Link href="/explore" className="pill pill-secondary">See the whole exhibition <ArrowUpRight size={16}/></Link><Link href="/art-games" className="pill pill-primary">Play the treasure adventure 🎪</Link></div>
      </section>
      {featuredVideos.length > 0 && <section className="container-page section-pad home-section">
        <div className="section-head">
          <div><div className="eyebrow">✦ MOVING PICTURES</div><h2 className="section-title serif mt-2">Cinema <span className="gradient-text">in motion.</span></h2><p className="muted text-sm mt-2">Putar langsung cuplikan film dan karya video yang tersimpan di database SPEKTRA.</p></div>
          <Link href="/explore?media=video" className="pill pill-secondary">Jelajahi video <ArrowUpRight size={15}/></Link>
        </div>
        <ArtworkGrid items={featuredVideos} user={user} empty="Belum ada video yang siap ditampilkan."/>
      </section>}

      {featuredAudio.length > 0 && <section className="container-page section-pad home-section">
        <div className="section-head">
          <div><div className="eyebrow">✦ THE SOUND TENT</div><h2 className="section-title serif mt-2">Listen to the <span className="gradient-text">art.</span></h2><p className="muted text-sm mt-2">Musik dan sound artwork dapat diputar langsung tanpa meninggalkan galeri.</p></div>
          <Link href="/explore?media=audio" className="pill pill-secondary">Jelajahi audio <ArrowUpRight size={15}/></Link>
        </div>
        <ArtworkGrid items={featuredAudio} user={user} empty="Belum ada audio yang siap ditampilkan."/>
      </section>}

      <section className="container-page section-pad home-section">
        <div className="section-head">
          <div><div className="eyebrow">01 / THE COMMUNITY LOVES</div><h2 className="section-title serif mt-2">A little <span className="gradient-text">inspiration.</span></h2><p className="muted text-sm mt-2">The works making people stop, look twice, and feel something.</p></div>
          <Link href="/explore?sort=popular" className="pill pill-secondary">See all trending <ArrowUpRight size={15}/></Link>
        </div>
        <ArtworkGrid items={trending} user={user}/>
      </section>

      {/* FITUR KATEGORI: setiap kartu kategori membuka galeri dengan filter kategori yang sama. */}
      <section className="home-disciplines section-pad">
        <div className="container-page">
          <div className="section-head">
            <div><div className="eyebrow">02 / FIND YOUR MEDIUM</div><h2 className="section-title serif mt-2">Every kind of <span className="gradient-text">creative.</span></h2><p className="muted text-sm mt-2">From a single sketch to a whole imaginary universe.</p></div>
            <Link href="/explore" className="pill pill-secondary">All disciplines <ArrowUpRight size={15}/></Link>
          </div>
          <div className="category-groups">
            {categoryGroups.map((group, groupIndex) => (<section className="category-group" key={group.title}>
                <div className="category-group-heading">
                  <div><div className="eyebrow">{group.eyebrow}</div><h3>{group.title}</h3></div>
                  <p>{group.description}</p>
                </div>
                <div className="category-gallery-grid">
                  {group.categories.map((category, index) => (<Link key={category.id} href={`/explore?category=${category.slug}`} className="category-gallery-card">
                      <div className="category-gallery-image">
                        <img src={category.cover_url || '/images/categories/default.svg'} alt={`Original illustration for ${category.name}`} loading={groupIndex === 0 && index < 8 ? 'eager' : 'lazy'}/>
                        <span className="category-gallery-index">{String(categories.findIndex((item) => item.id === category.id) + 1).padStart(2, '0')}</span>
                        <span className="category-gallery-icon" style={{ background: `${category.color}D9` }}>{category.icon}</span>
                      </div>
                      <div className="category-gallery-content">
                        <h3>{category.name}</h3>
                        <p>{category.description || 'Explore creative works and discover new perspectives in this discipline.'}</p>
                        <span className="category-gallery-link">Explore category <ArrowUpRight size={14}/></span>
                      </div>
                    </Link>))}
                </div>
              </section>))}
          </div>
          <div className="discipline-note"><Palette size={17}/><span>{categories.length} creative disciplines, each with its own illustrated cover and dedicated gallery filter.</span></div>
        </div>
      </section>

      <section className="container-page section-pad home-section">
        <div className="section-head">
          <div><div className="eyebrow">03 / ART HAS NO PASSPORT</div><h2 className="section-title serif mt-2">Made <span className="gradient-text">everywhere.</span></h2><p className="muted text-sm mt-2">A growing collection of perspectives from around the world.</p></div>
          <Link href="/explore" className="pill pill-secondary">Explore the world <Globe2 size={15}/></Link>
        </div>
        <div className="origin-grid">
          {origins.rows.map((origin, index) => (<Link href={`/explore?country=${origin.country_code}`} key={origin.country_code} className={`origin-card origin-card-${index + 1}`}>
              <span className="origin-flag">{countryFlag(origin.country_code)}</span>
              <span className="origin-name">{countryName(origin.country_code)}</span>
              <span className="origin-count">{origin.artwork_count} {Number(origin.artwork_count) === 1 ? 'artwork' : 'artworks'}</span>
              <ArrowUpRight className="origin-arrow" size={17}/>
            </Link>))}
          {!origins.rows.length && <div className="empty">The global gallery is waiting for its first creators.</div>}
        </div>
      </section>

      <section className="container-page section-pad home-section home-spotlight-section">
        <div className="section-head">
          <div><div className="eyebrow">04 / MEET THE MAKERS</div><h2 className="section-title serif mt-2">Creative <span className="gradient-text">spotlight.</span></h2><p className="muted text-sm mt-2">A little appreciation for the people behind the pixels, sounds, and stories.</p></div>
          <Link href="/explore" className="pill pill-secondary">Meet the community <ArrowUpRight size={15}/></Link>
        </div>
        <div className="creator-spotlight-grid">
          {spotlight.rows.map((creator, index) => (<Link href={`/creators/${creator.id}`} key={creator.id} className={`creator-spotlight-card creator-spotlight-${index + 1}`}>
              <span className="creator-spotlight-number">0{index + 1}</span>
              <span className="creator-spotlight-avatar">{creator.avatar_url ? <img src={creator.avatar_url} alt=""/> : creator.name?.[0] || '✦'}</span>
              <span className="creator-spotlight-name">{creator.name}</span>
              <span className="creator-spotlight-handle">@{creator.handle} · {countryFlag(creator.country_code)} {countryName(creator.country_code)}</span>
              <span className="creator-spotlight-stats">{creator.artwork_count} works <b>·</b> {creator.total_likes} appreciations</span>
              <ArrowUpRight className="creator-spotlight-arrow" size={18}/>
            </Link>))}
          {!spotlight.rows.length && <div className="empty">The first creators will appear here once they publish their work.</div>}
        </div>
      </section>

      <section className="home-challenges section-pad">
        <div className="container-page">
          <div className="section-head">
            <div><div className="eyebrow">05 / MAKE SOMETHING TOGETHER</div><h2 className="section-title serif mt-2">Creative <span className="gradient-text">challenges.</span></h2><p className="muted text-sm mt-2">A prompt, a deadline, and a world of possibilities.</p></div>
            <Link href="/challenges" className="pill pill-secondary">Discover challenges <Trophy size={15}/></Link>
          </div>
          {challenges.length ? <div className="challenge-grid">{challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge}/>)}</div> : <div className="empty">New challenges are on their way. Stay curious!</div>}
        </div>
      </section>

      <section className="container-page section-pad home-section">
        <div className="section-head">
          <div><div className="eyebrow">06 / FRESH FROM THE STUDIO</div><h2 className="section-title serif mt-2">Just <span className="gradient-text">created.</span></h2><p className="muted text-sm mt-2">New ideas deserve a little time in the spotlight.</p></div>
          <Link href="/explore?sort=latest" className="pill pill-secondary">See latest works <ArrowUpRight size={15}/></Link>
        </div>
        <ArtworkGrid items={latest} user={user}/>
      </section>

      <section className="container-page home-cta-wrap">
        <div className="home-cta">
          <div className="home-cta-orb home-cta-orb-one"/><div className="home-cta-orb home-cta-orb-two"/>
          <div className="home-cta-copy"><div className="eyebrow">YOUR STORY BELONGS HERE</div><h2>Make room for <em>more wonder.</em></h2><p>Share what you make. Find the people who get it. Be part of a creative world without borders.</p><Link href="/register" className="pill home-cta-button">Join the community <ArrowUpRight size={16}/></Link></div>
          <div className="home-cta-stamp"><Star size={18} fill="currentColor"/><span>CREATE<br />CONNECT<br />INSPIRE</span></div>
        </div>
      </section>
    </main>);
}

