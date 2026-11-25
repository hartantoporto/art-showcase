import { query } from '@/lib/db';
import { apiMember, ApiError, handleError } from '@/lib/auth';
import { str, positiveId } from '@/lib/validate';
export async function POST(request) {
    try {
        const user = await apiMember();
        const data = await request.json();
        const op = data.op;
        // LIKE DAN FAVORITES: simpan relasi Member dengan karya secara unik.
        if (['like', 'favorite'].includes(op)) {
            const id = positiveId(data.artwork_id);
            const art = await query('SELECT id FROM artworks WHERE id=$1 AND removed_at IS NULL', [id]);
            if (!art.rowCount)
                throw new ApiError('Karya tidak tersedia.', 404);
            const table = op === 'like' ? 'likes' : 'favorites';
            const existing = await query(`SELECT 1 FROM ${table} WHERE user_id=$1 AND artwork_id=$2`, [user.id, id]);
            if (existing.rowCount) {
                await query(`DELETE FROM ${table} WHERE user_id=$1 AND artwork_id=$2`, [user.id, id]);
                if (op === 'favorite')
                    await query('DELETE FROM collection_items ci USING collections c WHERE ci.collection_id=c.id AND c.user_id=$1 AND ci.artwork_id=$2', [user.id, id]);
            }
            else
                await query(`INSERT INTO ${table}(user_id,artwork_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, [user.id, id]);
            const { rows } = await query('SELECT COUNT(*)::int AS count FROM likes WHERE artwork_id=$1', [id]);
            return Response.json({ ok: true, active: !existing.rowCount, likes: rows[0].count });
        }
        // COMMENT: Member menambahkan komentar pada karya yang masih aktif.
        if (op === 'comment') {
            const id = positiveId(data.artwork_id);
            const body = str(data.body, 1, 1200, 'Komentar');
            const { rows } = await query(`INSERT INTO comments(user_id,artwork_id,body)
      SELECT $1,id,$3 FROM artworks WHERE id=$2 AND removed_at IS NULL RETURNING id`, [user.id, id, body]);
            if (!rows.length)
                throw new ApiError('Karya tidak tersedia.', 404);
            return Response.json({ ok: true, id: rows[0].id }, { status: 201 });
        }
        // DELETE COMMENT: hanya pemilik komentar yang dapat menghapusnya.
        if (op === 'deleteComment') {
            const { rowCount } = await query('DELETE FROM comments WHERE id=$1 AND user_id=$2', [positiveId(data.comment_id), user.id]);
            if (!rowCount)
                throw new ApiError('Komentar bukan milikmu.', 404);
            return Response.json({ ok: true });
        }
        // REPORT ARTWORK: cegah laporan terhadap karya sendiri atau laporan ganda.
        if (op === 'reportArtwork') {
            const id = positiveId(data.artwork_id);
            const reason = str(data.reason, 3, 80, 'Alasan');
            const detail = String(data.detail || '').slice(0, 500);
            const { rows } = await query(`INSERT INTO artwork_reports(user_id,artwork_id,reason,detail)
      SELECT $1,a.id,$3,$4 FROM artworks a WHERE a.id=$2 AND a.user_id<>$1 AND a.removed_at IS NULL RETURNING id`, [user.id, id, reason, detail]);
            if (!rows.length)
                throw new ApiError('Tidak dapat melaporkan karya sendiri atau karya tidak tersedia.', 403);
            return Response.json({ ok: true, id: rows[0].id }, { status: 201 });
        }
        // REPORT COMMENT: kirim laporan komentar ke antrean moderasi Admin.
        if (op === 'reportComment') {
            const id = positiveId(data.comment_id);
            const reason = str(data.reason, 3, 80, 'Alasan');
            const { rows } = await query(`INSERT INTO comment_reports(user_id,comment_id,reason)
      SELECT $1,c.id,$3 FROM comments c JOIN artworks a ON a.id=c.artwork_id
      WHERE c.id=$2 AND c.user_id<>$1 AND c.removed_at IS NULL AND a.removed_at IS NULL RETURNING id`, [user.id, id, reason]);
            if (!rows.length)
                throw new ApiError('Komentar tidak dapat dilaporkan.', 403);
            return Response.json({ ok: true }, { status: 201 });
        }
        // FOLLOW: Member dapat mengikuti atau berhenti mengikuti kreator lain.
        if (op === 'follow') {
            const id = positiveId(data.creator_id);
            if (Number(user.id) === id)
                throw new ApiError('Tidak bisa mengikuti diri sendiri.');
            const owner = await query("SELECT id FROM users WHERE id=$1 AND role='member'", [id]);
            if (!owner.rowCount)
                throw new ApiError('Kreator tidak ditemukan.', 404);
            const exist = await query('SELECT 1 FROM follows WHERE follower_id=$1 AND creator_id=$2', [user.id, id]);
            if (exist.rowCount)
                await query('DELETE FROM follows WHERE follower_id=$1 AND creator_id=$2', [user.id, id]);
            else
                await query('INSERT INTO follows(follower_id,creator_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [user.id, id]);
            const { rows } = await query('SELECT COUNT(*)::int AS count FROM follows WHERE creator_id=$1', [id]);
            return Response.json({ ok: true, active: !exist.rowCount, count: rows[0].count });
        }
        throw new ApiError('Aksi tidak dikenal.');
    }
    catch (e) {
        return handleError(e);
    }
}

