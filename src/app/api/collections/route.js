import { query } from '@/lib/db';
import { apiMember, ApiError, handleError } from '@/lib/auth';
import { str, positiveId } from '@/lib/validate';
export async function POST(request) {
    try {
        const u = await apiMember();
        const d = await request.json();
        if (d.op === 'create') {
            const name = str(d.name, 2, 80, 'Nama moodboard');
            const description = String(d.description || '').slice(0, 300);
            const { rows } = await query('INSERT INTO collections(user_id,name,description) VALUES($1,$2,$3) RETURNING id', [u.id, name, description]);
            return Response.json({ ok: true, id: rows[0].id });
        }
        if (d.op === 'delete') {
            const { rowCount } = await query('DELETE FROM collections WHERE id=$1 AND user_id=$2', [positiveId(d.collection_id), u.id]);
            if (!rowCount)
                throw new ApiError('Moodboard tidak ditemukan.', 404);
            return Response.json({ ok: true });
        }
        if (d.op === 'add' || d.op === 'remove') {
            const cid = positiveId(d.collection_id), aid = positiveId(d.artwork_id);
            const x = await query('SELECT id FROM collections WHERE id=$1 AND user_id=$2', [cid, u.id]);
            if (!x.rowCount)
                throw new ApiError('Moodboard bukan milikmu.', 403);
            if (d.op === 'add') {
                const { rowCount } = await query(`INSERT INTO collection_items(collection_id,artwork_id)
        SELECT $1,a.id FROM artworks a JOIN favorites f ON f.artwork_id=a.id AND f.user_id=$3 WHERE a.id=$2 AND a.removed_at IS NULL ON CONFLICT DO NOTHING`, [cid, aid, u.id]);
                if (!rowCount)
                    throw new ApiError('Simpan karya sebagai favorit terlebih dahulu, atau karya sudah ada di moodboard.');
            }
            else
                await query('DELETE FROM collection_items WHERE collection_id=$1 AND artwork_id=$2', [cid, aid]);
            return Response.json({ ok: true });
        }
        throw new ApiError('Aksi moodboard tidak dikenal.');
    }
    catch (e) {
        return handleError(e);
    }
}

