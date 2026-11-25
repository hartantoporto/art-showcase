import { query } from '@/lib/db';
import { apiMember, ApiError, handleError } from '@/lib/auth';
import { saveUpload, removeLocalUpload } from '@/lib/upload';
import { str, positiveId, tags, countryCode, assertUrl } from '@/lib/validate';
export const runtime = 'nodejs';
// CREATE ARTWORK: Member mengunggah media dan metadata karya ke PostgreSQL.
export async function POST(request) {
    let saved;
    try {
        const user = await apiMember();
        const form = await request.formData();
        const title = str(form.get('title'), 3, 130, 'Judul');
        const description = str(form.get('description'), 5, 5000, 'Deskripsi');
        const categoryId = positiveId(form.get('category_id'), 'Kategori');
        const t = tags(form.get('tags'));
        const country = countryCode(form.get('country_code'));
        const optional = (key, max = 180) => { const value = String(form.get(key) || '').trim(); if (value.length > max)
            throw new ApiError(`${key} maksimal ${max} karakter.`); return value || null; };
        const originalArtist = optional('original_artist');
        const creationYear = optional('creation_year', 120);
        const creationLocation = optional('creation_location');
        const medium = optional('medium');
        const collectionName = optional('collection_name');
        const sourceUrl = assertUrl(optional('source_url', 2000));
        const licenseLabel = optional('license_label', 120);
        const cat = await query('SELECT id FROM categories WHERE id=$1', [categoryId]);
        if (!cat.rowCount)
            throw new ApiError('Kategori tidak ditemukan.');
        saved = await saveUpload(form.get('file'), { maxMB: 15 });
        const { rows } = await query(`INSERT INTO artworks(user_id,category_id,title,description,media_url,media_type,original_filename,country_code,tags,original_artist,creation_year,creation_location,medium,collection_name,source_url,license_label)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`, [user.id, categoryId, title, description, saved.url, saved.media_type, saved.original_filename, country, t, originalArtist, creationYear, creationLocation, medium, collectionName, sourceUrl, licenseLabel]);
        return Response.json({ ok: true, id: rows[0].id }, { status: 201 });
    }
    catch (e) {
        if (saved)
            await removeLocalUpload(saved.url);
        return handleError(e);
    }
}

