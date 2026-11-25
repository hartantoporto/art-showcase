import { currentUser, ApiError, handleError } from '@/lib/auth';
import { query, transaction } from '@/lib/db';

export const runtime = 'nodejs';

const VALID_TICKETS = new Set([
  'velvet-stage',
  'wandering-star',
  'music-parade',
]);

const DEFAULT_PROGRESS = {
  found_tickets: [],
  completed_levels: [],
  unlocked_level: 0,
  gold_tickets: 0,
  golden_gallery_pass: false,
  aurora_badge_earned: false,
};

async function ensureProgress(userId, executor = query) {
  await executor(
    `INSERT INTO game_progress(user_id)
     VALUES($1)
     ON CONFLICT(user_id) DO NOTHING`,
    [userId],
  );
}

async function readProgress(userId, executor = query) {
  const { rows } = await executor(
    `SELECT found_tickets, completed_levels, unlocked_level, gold_tickets,
            golden_gallery_pass, aurora_badge_earned
     FROM game_progress
     WHERE user_id=$1`,
    [userId],
  );
  return rows[0] || DEFAULT_PROGRESS;
}

// GET PROGRES: hanya Member yang membaca tiket dan level tersimpan dari akun.
export async function GET() {
  try {
    const user = await currentUser();
    if (!user || user.role !== 'member') {
      return Response.json({ authenticated: false, progress: null });
    }

    await ensureProgress(user.id);
    return Response.json({
      authenticated: true,
      progress: await readProgress(user.id),
    });
  } catch (error) {
    return handleError(error);
  }
}

// SIMPAN PROGRES: aksi permainan memerlukan sesi Member; Guest hanya bermain sementara di browser.
export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user || user.role !== 'member') {
      throw new ApiError('Masuk sebagai Member untuk menyimpan progres dan hadiah petualangan.', user ? 403 : 401);
    }

    const body = await request.json();
    const result = await transaction(async (client) => {
      await ensureProgress(user.id, client.query.bind(client));
      const { rows } = await client.query(
        `SELECT found_tickets, completed_levels, unlocked_level, gold_tickets,
                golden_gallery_pass, aurora_badge_earned
         FROM game_progress WHERE user_id=$1 FOR UPDATE`,
        [user.id],
      );
      const current = rows[0];

      // LEVEL START: buka checkpoint awal satu kali dan pertahankan progres yang sudah ada.
      if (body.op === 'start') {
        await client.query(
          `UPDATE game_progress
           SET completed_levels = CASE
                 WHEN 0::smallint = ANY(completed_levels) THEN completed_levels
                 ELSE array_append(completed_levels, 0::smallint)
               END,
               unlocked_level = GREATEST(unlocked_level, 1),
               updated_at = NOW()
           WHERE user_id=$1`,
          [user.id],
        );
      // TIKET EMAS: tiga tiket unik membuka Golden Gallery Pass.
      } else if (body.op === 'collect-ticket') {
        const ticketKey = String(body.ticket_key || '');
        if (!VALID_TICKETS.has(ticketKey)) {
          throw new ApiError('Tiket tidak dikenal.');
        }

        const found = current.found_tickets.includes(ticketKey)
          ? current.found_tickets
          : [...current.found_tickets, ticketKey];
        const ticketCount = Math.min(found.length, 3);
        const passUnlocked = ticketCount >= 3;

        await client.query(
          `UPDATE game_progress
           SET found_tickets=$2,
               gold_tickets=$3,
               golden_gallery_pass=$4,
               completed_levels=CASE
                 WHEN $4 AND NOT (1::smallint = ANY(completed_levels)) THEN array_append(completed_levels, 1::smallint)
                 ELSE completed_levels
               END,
               unlocked_level=CASE
                 WHEN $4 THEN GREATEST(unlocked_level, 2)
                 ELSE unlocked_level
               END,
               updated_at=NOW()
           WHERE user_id=$1`,
          [user.id, found, ticketCount, passUnlocked],
        );
      // VALIDASI LEVEL: backend memeriksa urutan level, bukan hanya status tombol di browser.
      } else if (body.op === 'complete-level') {
        const level = Number(body.level);
        if (![2, 3, 4].includes(level)) {
          throw new ApiError('Level yang dikirim tidak valid.');
        }
        if (current.unlocked_level < level) {
          throw new ApiError('Selesaikan level sebelumnya terlebih dahulu.', 403);
        }
        if (level === 2 && !current.golden_gallery_pass) {
          throw new ApiError('Kumpulkan tiga Tiket Emas untuk membuka level ini.', 403);
        }
        if (level === 3 && !current.completed_levels.includes(2)) {
          throw new ApiError('Selesaikan kuis mahakarya terlebih dahulu.', 403);
        }
        if (level === 4 && !current.completed_levels.includes(3)) {
          throw new ApiError('Selesaikan puzzle karya terlebih dahulu.', 403);
        }

        await client.query(
          `UPDATE game_progress
           SET completed_levels=CASE
                 WHEN $2 = ANY(completed_levels) THEN completed_levels
                 ELSE array_append(completed_levels, $2::smallint)
               END,
               unlocked_level=GREATEST(unlocked_level, ($2 + 1)::smallint),
               aurora_badge_earned=CASE WHEN $2=4 THEN TRUE ELSE aurora_badge_earned END,
               updated_at=NOW()
           WHERE user_id=$1`,
          [user.id, level],
        );
      // RESET: hapus progres permainan milik Member yang sedang login.
      } else if (body.op === 'reset') {
        await client.query(
          `UPDATE game_progress
           SET found_tickets=ARRAY[]::TEXT[],
               completed_levels=ARRAY[]::SMALLINT[],
               unlocked_level=0,
               gold_tickets=0,
               golden_gallery_pass=FALSE,
               aurora_badge_earned=FALSE,
               updated_at=NOW()
           WHERE user_id=$1`,
          [user.id],
        );
      } else {
        throw new ApiError('Perintah petualangan tidak dikenal.');
      }

      return readProgress(user.id, client.query.bind(client));
    });

    return Response.json({ ok: true, progress: result });
  } catch (error) {
    return handleError(error);
  }
}
