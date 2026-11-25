import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { currentUser, newSession, dropSession, ApiError, handleError } from '@/lib/auth';
import { str } from '@/lib/validate';
export const runtime = 'nodejs';
export async function POST(request) {
    try {
        const data = await request.json();
        const op = data.op;
        if (op === 'logout') {
            await dropSession();
            return Response.json({ ok: true });
        }
        if (op === 'me') {
            return Response.json({ user: await currentUser() });
        }
        if (op === 'register') {
            const name = str(data.name, 2, 90, 'Nama');
            const email = str(data.email, 5, 180, 'Email').toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                throw new ApiError('Format email tidak valid.');
            if (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 100)
                throw new ApiError('Password harus 8–100 karakter.');
            if (!['member', 'curator'].includes(data.role))
                throw new ApiError('Pilih role Member atau Curator.');
            const handle = str(data.handle, 3, 40, 'Username').toLowerCase();
            if (!/^[a-z0-9_]{3,40}$/.test(handle))
                throw new ApiError('Username hanya boleh huruf kecil, angka, underscore.');
            const passwordHash = await bcrypt.hash(data.password, 12);
            const { rows } = await query(`INSERT INTO users(name,handle,email,password_hash,role,curator_status)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id,role`, [name, handle, email, passwordHash, data.role, data.role === 'curator' ? 'pending' : null]);
            await newSession(rows[0].id);
            return Response.json({ ok: true, redirect: data.role === 'curator' ? '/curator/pending' : '/member' }, { status: 201 });
        }
        if (op === 'login') {
            const email = str(data.email, 5, 180, 'Email').toLowerCase();
            const { rows } = await query('SELECT id,password_hash,role,curator_status FROM users WHERE LOWER(email)=$1 LIMIT 1', [email]);
            if (!rows.length || !(await bcrypt.compare(data.password || '', rows[0].password_hash)))
                throw new ApiError('Email atau password salah.', 401);
            await newSession(rows[0].id);
            const u = rows[0];
            return Response.json({ ok: true, redirect: u.role === 'admin' ? '/admin' : u.role === 'member' ? '/member' : u.curator_status === 'approved' ? '/curator' : '/curator/pending' });
        }
        throw new ApiError('Aksi autentikasi tidak dikenal.');
    }
    catch (e) {
        return handleError(e);
    }
}

