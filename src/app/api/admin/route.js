import { query, transaction } from '@/lib/db';
import { apiAdmin, ApiError, handleError } from '@/lib/auth';
import { str, positiveId } from '@/lib/validate';
export async function POST(request) {
    try {
        const u = await apiAdmin();
        const d = await request.json();
        const op = d.op;
        // VERIFIKASI CURATOR: Admin menyetujui atau menolak pendaftaran.
        if (op === 'verify') {
            const id = positiveId(d.user_id);
            if (!['approved', 'rejected'].includes(d.status))
                throw new ApiError('Status tidak valid.');
            const reason = d.status === 'rejected' ? str(d.reason || 'Pendaftaran belum memenuhi ketentuan.', 5, 500, 'Alasan penolakan') : null;
            const { rowCount } = await query(`UPDATE users SET curator_status=$1,rejection_reason=$2
       WHERE id=$3 AND role='curator' AND curator_status='pending'`, [d.status, reason, id]);
            if (!rowCount)
                throw new ApiError('Pendaftaran Curator tidak lagi Pending.', 409);
            return Response.json({ ok: true });
        }
        // MANAJEMEN USER: Admin dapat menghapus Member atau Curator, bukan Admin.
        if (op === 'deleteUser') {
            const id = positiveId(d.user_id);
            if (id === Number(u.id))
                throw new ApiError('Tidak boleh menghapus akun sendiri.', 403);
            const { rowCount } = await query("DELETE FROM users WHERE id=$1 AND role IN ('member','curator')", [id]);
            if (!rowCount)
                throw new ApiError('User tidak ditemukan atau tidak boleh dihapus.', 404);
            return Response.json({ ok: true });
        }
        // CREATE CATEGORY: tambah kategori baru dengan slug dan warna yang valid.
        if (op === 'categoryCreate') {
            const name = str(d.name, 2, 70, 'Nama kategori');
            const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';
            const color = /^#[0-9A-Fa-f]{6}$/.test(d.color || '') ? d.color : '#9AC3B4';
            await query('INSERT INTO categories(name,slug,icon,color) VALUES($1,$2,$3,$4)', [name, slug, String(d.icon || '✦').slice(0, 10), color]);
            return Response.json({ ok: true });
        }
        // UPDATE CATEGORY: ubah nama, ikon, dan warna kategori.
        if (op === 'categoryEdit') {
            const id = positiveId(d.category_id);
            const name = str(d.name, 2, 70, 'Nama kategori');
            const color = /^#[0-9A-Fa-f]{6}$/.test(d.color || '') ? d.color : '#9AC3B4';
            const { rowCount } = await query('UPDATE categories SET name=$1,icon=$2,color=$3 WHERE id=$4', [name, String(d.icon || '✦').slice(0, 10), color, id]);
            if (!rowCount)
                throw new ApiError('Kategori tidak ditemukan.', 404);
            return Response.json({ ok: true });
        }
        // DELETE CATEGORY: foreign key mencegah kategori aktif dihapus paksa.
        if (op === 'categoryDelete') {
            const { rowCount } = await query('DELETE FROM categories WHERE id=$1', [positiveId(d.category_id)]);
            if (!rowCount)
                throw new ApiError('Kategori tidak ditemukan.', 404);
            return Response.json({ ok: true });
        }
        // MODERASI KARYA: Dismiss Report atau Take Down melalui transaksi database.
        if (op === 'moderateArtwork') {
            const id = positiveId(d.artwork_id);
            if (!['dismissed', 'taken_down'].includes(d.status))
                throw new ApiError('Status moderasi tidak valid.');
            await transaction(async (client) => {
                const report = await client.query("SELECT id FROM artwork_reports WHERE artwork_id=$1 AND status='pending' FOR UPDATE", [id]);
                if (!report.rowCount)
                    throw new ApiError('Tidak ada laporan pending.', 404);
                if (d.status === 'taken_down')
                    await client.query('UPDATE artworks SET removed_at=NOW() WHERE id=$1', [id]);
                await client.query("UPDATE artwork_reports SET status=$1 WHERE artwork_id=$2 AND status='pending'", [d.status, id]);
            });
            return Response.json({ ok: true });
        }
        // MODERASI KOMENTAR: tangani laporan komentar tanpa menghapus data laporan.
        if (op === 'moderateComment') {
            const id = positiveId(d.comment_id);
            if (!['dismissed', 'taken_down'].includes(d.status))
                throw new ApiError('Status moderasi tidak valid.');
            await transaction(async (client) => {
                const r = await client.query("SELECT id FROM comment_reports WHERE comment_id=$1 AND status='pending' FOR UPDATE", [id]);
                if (!r.rowCount)
                    throw new ApiError('Tidak ada laporan pending.', 404);
                if (d.status === 'taken_down')
                    await client.query('UPDATE comments SET removed_at=NOW() WHERE id=$1', [id]);
                await client.query("UPDATE comment_reports SET status=$1 WHERE comment_id=$2 AND status='pending'", [d.status, id]);
            });
            return Response.json({ ok: true });
        }
        throw new ApiError('Aksi Admin tidak dikenal.');
    }
    catch (e) {
        return handleError(e);
    }
}

