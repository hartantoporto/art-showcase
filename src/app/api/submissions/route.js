import { query } from '@/lib/db';
import { apiMember, apiCurator, ApiError, handleError } from '@/lib/auth';
import { positiveId } from '@/lib/validate';
export async function POST(request) {
    try {
        const data = await request.json();
        const op = data.op;
        // SUBMIT: Member mengirim satu karya miliknya ke challenge yang sedang aktif.
        if (op === 'submit') {
            const u = await apiMember();
            const cid = positiveId(data.challenge_id), aid = positiveId(data.artwork_id);
            const { rows } = await query(`INSERT INTO submissions(challenge_id,user_id,artwork_id)
      SELECT c.id,$1,a.id FROM challenges c JOIN artworks a ON a.id=$3
      WHERE c.id=$2 AND a.user_id=$1 AND a.removed_at IS NULL AND NOW()>=c.start_at AND NOW()<c.end_at
      RETURNING id`, [u.id, cid, aid]);
            if (!rows.length)
                throw new ApiError('Challenge belum aktif/sudah berakhir atau karya tidak valid.', 403);
            return Response.json({ ok: true }, { status: 201 });
        }
        // WITHDRAW: Member menarik submisi sebelum waktu challenge berakhir.
        if (op === 'withdraw') {
            const u = await apiMember();
            const cid = positiveId(data.challenge_id);
            const { rowCount } = await query(`DELETE FROM submissions s USING challenges c
      WHERE s.challenge_id=c.id AND s.challenge_id=$1 AND s.user_id=$2 AND NOW()<c.end_at`, [cid, u.id]);
            if (!rowCount)
                throw new ApiError('Submisi tidak ada atau batas waktu sudah berlalu.', 403);
            return Response.json({ ok: true });
        }
        // WINNER: Curator pemilik challenge memilih maksimal tiga pemenang setelah selesai.
        if (op === 'winner') {
            const u = await apiCurator();
            const cid = positiveId(data.challenge_id), sid = positiveId(data.submission_id);
            const rank = data.rank === null || data.rank === '' ? null : Number(data.rank);
            if (rank !== null && ![1, 2, 3].includes(rank))
                throw new ApiError('Peringkat hanya 1, 2, atau 3.');
            const { rowCount } = await query(`UPDATE submissions s SET winner_rank=$1 FROM challenges c,artworks a
      WHERE s.challenge_id=c.id AND s.artwork_id=a.id AND s.id=$2 AND s.challenge_id=$3
        AND c.curator_id=$4 AND c.end_at<NOW() AND a.removed_at IS NULL`, [rank, sid, cid, u.id]);
            if (!rowCount)
                throw new ApiError('Pemenang hanya bisa ditetapkan setelah challenge berakhir pada challenge milikmu.', 403);
            return Response.json({ ok: true });
        }
        throw new ApiError('Aksi tidak dikenal.');
    }
    catch (e) {
        return handleError(e);
    }
}

