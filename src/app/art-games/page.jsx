import CircusGames from '@/components/CircusGames';
import { currentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import './art-games.css';

export const metadata = {
  title: 'Petualangan Harta Karun Seni - SPEKTRA Circus',
  description: 'Jelajahi karya seni dari database SPEKTRA, kumpulkan Tiket Emas, pecahkan puzzle, dan buka Galeri Emas.',
};

const EMPTY_PROGRESS = {
  found_tickets: [],
  completed_levels: [],
  unlocked_level: 0,
  gold_tickets: 0,
  golden_gallery_pass: false,
  aurora_badge_earned: false,
};

// GAME DAN DATABASE: hanya Member yang memuat progres tersimpan dari PostgreSQL.
// Guest tetap dapat mencoba permainan sebagai pratinjau tanpa menyimpan hadiah permanen.
export default async function ArtGamesPage() {
  const sessionUser = await currentUser();
  const member = sessionUser?.role === 'member' ? sessionUser : null;
  const titles = [
    'Mona Lisa',
    'The Great Wave off Kanagawa',
    'Girl with a Pearl Earring',
    'Bach — Cello Suite No. 1: Prelude',
  ];

  const [artworkResult, progressResult] = await Promise.all([
    query(
      `SELECT a.id, a.title, a.description, a.media_url, a.media_type,
              a.original_artist, a.creation_year, a.country_code,
              c.name AS category_name, u.name AS creator_name
       FROM artworks a
       JOIN categories c ON c.id=a.category_id
       JOIN users u ON u.id=a.user_id
       WHERE a.removed_at IS NULL AND LOWER(a.title)=ANY($1::text[])`,
      [titles.map((title) => title.toLowerCase())],
    ),
    member
      ? (async () => {
          await query(
            `INSERT INTO game_progress(user_id)
             VALUES($1) ON CONFLICT(user_id) DO NOTHING`,
            [member.id],
          );
          return query(
            `SELECT found_tickets, completed_levels, unlocked_level, gold_tickets,
                    golden_gallery_pass, aurora_badge_earned
             FROM game_progress WHERE user_id=$1`,
            [member.id],
          );
        })()
      : Promise.resolve({ rows: [] }),
  ]);

  // REFERENSI MISI: pertanyaan dan puzzle mengambil karya yang sama dengan galeri utama.
  const artworkMap = Object.fromEntries(
    artworkResult.rows.map((artwork) => [artwork.title.toLowerCase(), artwork]),
  );

  const gameArtworks = {
    monaLisa: artworkMap['mona lisa'] || null,
    greatWave: artworkMap['the great wave off kanagawa'] || null,
    pearlEarring: artworkMap['girl with a pearl earring'] || null,
    bach: artworkMap['bach — cello suite no. 1: prelude'] || null,
  };

  return (
    <CircusGames
      user={member ? { id: member.id, name: member.name, role: member.role } : null}
      initialProgress={progressResult.rows[0] || EMPTY_PROGRESS}
      gameArtworks={gameArtworks}
    />
  );
}
