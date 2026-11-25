import { query } from '@/lib/db';
import { apiCurator, handleError } from '@/lib/auth';
import { challengeFields } from '@/lib/validate';
import { saveUpload, removeLocalUpload } from '@/lib/upload';
export const runtime = 'nodejs';
// CREATE CHALLENGE: Curator Approved membuat challenge dan mengunggah banner.
export async function POST(request) {
    let media;
    try {
        const u = await apiCurator();
        const f = await request.formData();
        const v = challengeFields(Object.fromEntries(f));
        media = await saveUpload(f.get('banner'), { imageOnly: true, maxMB: 8 });
        const { rows } = await query(`INSERT INTO challenges(curator_id,title,description,rules,prize,start_at,end_at,banner_url)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, [u.id, v.title, v.description, v.rules, v.prize, v.start_at, v.end_at, media.url]);
        return Response.json({ ok: true, id: rows[0].id }, { status: 201 });
    }
    catch (e) {
        if (media)
            await removeLocalUpload(media.url);
        return handleError(e);
    }
}

