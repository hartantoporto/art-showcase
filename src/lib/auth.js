import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from './db';

// AUTENTIKASI SERVER: session cookie, pemeriksaan role, dan otorisasi endpoint.
export const COOKIE_NAME = 'spektra_session';
const WEEK_SECONDS = 7 * 24 * 60 * 60;
const hash = (token) => createHash('sha256').update(token).digest('hex');
export async function newSession(userId) {
    const token = randomBytes(32).toString('hex');
    await query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW() + INTERVAL \'7 days\')', [hash(token), userId]);
    (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: WEEK_SECONDS });
}
export async function dropSession() {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (token)
        await query('DELETE FROM sessions WHERE token_hash=$1', [hash(token)]);
    jar.delete(COOKIE_NAME);
}
export async function currentUser() {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token)
        return null;
    const { rows } = await query(`SELECT u.id,u.name,u.handle,u.email,u.role,u.curator_status,u.rejection_reason,u.avatar_url,u.bio,u.country_code,u.website_url
    FROM sessions s JOIN users u ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>NOW() LIMIT 1`, [hash(token)]);
    return rows[0] || null;
}
export async function requireRole(role) {
    const user = await currentUser();
    if (!user)
        redirect('/login');
    if (user.role !== role)
        redirect('/');
    if (role === 'curator' && user.curator_status !== 'approved')
        redirect('/curator/pending');
    return user;
}
export function errorResponse(message, status = 400) { return Response.json({ error: message }, { status }); }
export async function apiMember() { const u = await currentUser(); if (!u || u.role !== 'member')
    throw new ApiError('Hanya Member yang dapat melakukan aksi ini.', 403); return u; }
export async function apiCurator() { const u = await currentUser(); if (!u || u.role !== 'curator' || u.curator_status !== 'approved')
    throw new ApiError('Curator belum disetujui atau akses tidak diizinkan.', 403); return u; }
export async function apiAdmin() { const u = await currentUser(); if (!u || u.role !== 'admin')
    throw new ApiError('Akses Admin diperlukan.', 403); return u; }
export class ApiError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
}
export function handleError(e) {
    if (e instanceof ApiError)
        return errorResponse(e.message, e.status);
    if (typeof e?.message === 'string' && e.message.includes('[SPEKTRA DB CONFIG]'))
        return errorResponse(e.message, 503);
    if (e.code === '23505')
        return errorResponse('Data sudah ada atau aksi ini melanggar batas unik.', 409);
    if (e.code === '23503')
        return errorResponse('Data masih digunakan dan tidak dapat dihapus.', 409);
    if (e.code === '23514')
        return errorResponse('Data tidak memenuhi aturan database.', 400);
    console.error('[SPEKTRA API]', e);
    return errorResponse('Terjadi kesalahan server. Coba lagi.', 500);
}

