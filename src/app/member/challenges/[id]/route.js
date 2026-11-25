import { query } from '@/lib/db';
import { apiCurator, ApiError, handleError } from '@/lib/auth';
import { challengeFields, positiveId } from '@/lib/validate';
import { saveUpload, removeLocalUpload } from '@/lib/upload';
export const runtime = 'nodejs';
// UPDATE CHALLENGE: Curator hanya dapat mengubah challenge miliknya sendiri.
export async function PATCH(request, context) {
    let media;
    try {
        const u = await apiCurator();
        const { id } = await context.params;
        const challengeId = positiveId(id);
        const f = await request.formData();
        const v = challengeFields(Object.fromEntries(f));
        const old = await query('SELECT banner_url FROM challenges WHERE id=$1 AND curator_id=$2', [challengeId, u.id]);
        if (!old.rowCount)
            throw new ApiError('Challenge tidak ditemukan atau bukan milikmu.', 404);
        if (f.get('banner')?.size)
            media = await saveUpload(f.get('banner'), { imageOnly: true, maxMB: 8 });
        await query(`UPDATE challenges SET title=$1,description=$2,rules=$3,prize=$4,start_at=$5,end_at=$6,banner_url=$7
      WHERE id=$8 AND curator_id=$9`, [v.title, v.description, v.rules, v.prize, v.start_at, v.end_at, media?.url || old.rows[0].banner_url, challengeId, u.id]);
        if (media)
            await removeLocalUpload(old.rows[0].banner_url);
        return Response.json({ ok: true, id: challengeId });
    }
    catch (e) {
        if (media)
            await removeLocalUpload(media.url);
        return handleError(e);
    }
}
// DELETE CHALLENGE: hapus challenge milik Curator dan file banner lokalnya.
export async function DELETE(_request, context) {
    try {
        const u = await apiCurator();
        const { id } = await context.params;
        const cid = positiveId(id);
        const { rows } = await query('DELETE FROM challenges WHERE id=$1 AND curator_id=$2 RETURNING banner_url', [cid, u.id]);
        if (!rows.length)
            throw new ApiError('Challenge tidak ditemukan atau bukan milikmu.', 404);
        await removeLocalUpload(rows[0].banner_url);
        return Response.json({ ok: true });
    }
    catch (e) {
        return handleError(e);
    }
}

