import { query } from '@/lib/db';
import { apiMember, ApiError, handleError } from '@/lib/auth';
import { str, positiveId, tags, countryCode, assertUrl } from '@/lib/validate';
import { removeLocalUpload } from '@/lib/upload';
// UPDATE ARTWORK: hanya metadata karya milik Member yang dapat diubah.
export async function PATCH(request, context) {
    try {
        const user = await apiMember();
        const { id } = await context.params;
        const itemId = positiveId(id);
        const obj = await request.json();
        const title = str(obj.title, 3, 130, 'Judul');
        const description = str(obj.description, 5, 5000, 'Deskripsi');
        const categoryId = positiveId(obj.category_id, 'Kategori');
        const t = tags(obj.tags);
        const country = countryCode(obj.country_code);
        const optional = (key, max = 180) => { const value = String(obj[key] || '').trim(); if (value.length > max)
            throw new ApiError(`${key} maksimal ${max} karakter.`); return value || null; };
        const originalArtist = optional('original_artist');
        const creationYear = optional('creation_year', 120);
        const creationLocation = optional('creation_location');
        const medium = optional('medium');
        const collectionName = optional('collection_name');
        const sourceUrl = assertUrl(optional('source_url', 2000));
        const licenseLabel = optional('license_label', 120);
        const result = await query(`UPDATE artworks SET title=$1,description=$2,category_id=$3,tags=$4,country_code=$5,
    original_artist=$6,creation_year=$7,creation_location=$8,medium=$9,collection_name=$10,source_url=$11,license_label=$12,updated_at=NOW()
    WHERE id=$13 AND user_id=$14 AND removed_at IS NULL RETURNING id`, [title, description, categoryId, t, country, originalArtist, creationYear, creationLocation, medium, collectionName, sourceUrl, licenseLabel, itemId, user.id]);
        if (!result.rowCount)
            throw new ApiError('Karya tidak ditemukan atau bukan milikmu.', 404);
        // media_url/media_type intentionally cannot change on Edit according to assignment.
        return Response.json({ ok: true, id: itemId });
    }
    catch (e) {
        return handleError(e);
    }
}
// DELETE ARTWORK: hapus karya milik sendiri dan bersihkan file upload lokal.
export async function DELETE(_request, context) {
    try {
        const user = await apiMember();
        const { id } = await context.params;
        const itemId = positiveId(id);
        const { rows } = await query('DELETE FROM artworks WHERE id=$1 AND user_id=$2 RETURNING media_url', [itemId, user.id]);
        if (!rows.length)
            throw new ApiError('Karya tidak ditemukan atau bukan milikmu.', 404);
        await removeLocalUpload(rows[0].media_url);
        return Response.json({ ok: true });
    }
    catch (e) {
        return handleError(e);
    }
}

