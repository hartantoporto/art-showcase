'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { requireRole, currentUser, dropSession } from '@/lib/auth';
import { str, assertUrl, countryCode } from '@/lib/validate';
import { saveUpload, removeLocalUpload } from '@/lib/upload';
const fail = (message) => redirect('/member/settings?error=' + encodeURIComponent(message));
// UPDATE PROFILE: Member mengubah nama, bio, negara, tautan, dan foto profil.
export async function updateProfileAction(form) {
    const user = await requireRole('member');
    let avatar;
    try {
        const name = str(form.get('name'), 2, 90, 'Nama');
        const bio = String(form.get('bio') || '').slice(0, 500);
        const website = assertUrl(String(form.get('website_url') || ''));
        const country = form.get('country_code') ? countryCode(form.get('country_code')) : null;
        if (form.get('avatar')?.size)
            avatar = await saveUpload(form.get('avatar'), { imageOnly: true, maxMB: 5 });
        await query('UPDATE users SET name=$1,bio=$2,website_url=$3,country_code=$4,avatar_url=COALESCE($5,avatar_url) WHERE id=$6', [name, bio, website, country, avatar?.url || null, user.id]);
        if (avatar)
            await removeLocalUpload(user.avatar_url);
    }
    catch (e) {
        if (avatar)
            await removeLocalUpload(avatar.url);
        fail(e.message || 'Gagal menyimpan profil.');
    }
    redirect('/member/settings?saved=1');
}
// UPDATE ACCOUNT: verifikasi kata sandi lama sebelum mengubah email atau kata sandi.
export async function updateAccountAction(form) {
    const user = await requireRole('member');
    try {
        const email = str(form.get('email'), 5, 180, 'Email').toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            throw Error('Email tidak valid.');
        const oldPassword = String(form.get('old_password') || '');
        const newPassword = String(form.get('new_password') || '');
        const { rows } = await query('SELECT password_hash FROM users WHERE id=$1', [user.id]);
        if (!await bcrypt.compare(oldPassword, rows[0].password_hash))
            throw Error('Password saat ini salah.');
        if (newPassword && (newPassword.length < 8 || newPassword.length > 100))
            throw Error('Password baru minimal 8 karakter.');
        const hash = newPassword ? await bcrypt.hash(newPassword, 12) : rows[0].password_hash;
        await query('UPDATE users SET email=$1,password_hash=$2 WHERE id=$3', [email, hash, user.id]);
    }
    catch (e) {
        fail(e.code === '23505' ? 'Email sudah terdaftar.' : e.message || 'Gagal menyimpan akun.');
    }
    redirect('/member/settings?account=1');
}
export async function deleteRejectedCuratorAction() {
    const user = await currentUser();
    if (!user || user.role !== 'curator' || user.curator_status !== 'rejected')
        redirect('/');
    await query('DELETE FROM users WHERE id=$1 AND role=$2 AND curator_status=$3', [user.id, 'curator', 'rejected']);
    await dropSession();
    redirect('/');
}

