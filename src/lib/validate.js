import { ApiError } from './auth';
import { COUNTRIES } from './countries';

// VALIDASI INPUT: periksa panjang teks, ID, negara, tag, URL, dan periode challenge.
export function str(v, min = 1, max = 1000, label = 'Field') {
    if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max)
        throw new ApiError(`${label} harus berisi ${min}–${max} karakter.`);
    return v.trim();
}
export function positiveId(value, label = 'ID') { const n = Number(value); if (!Number.isSafeInteger(n) || n <= 0)
    throw new ApiError(`${label} tidak valid.`); return n; }
export function countryCode(v) { if (!COUNTRIES.some(c => c[0] === v))
    throw new ApiError('Pilih negara asal karya.'); return v; }
export function tags(v) { const a = (typeof v === 'string' ? v.split(',') : v || []).map(s => String(s).trim().replace(/^#/, '')).filter(Boolean); const items = [...new Set(a)]; if (!items.length || items.length > 12 || items.some(t => t.length > 30))
    throw new ApiError('Tags harus 1–12, maksimal 30 karakter per tag.'); return items; }
export function assertUrl(v) { if (!v)
    return null; try {
    const url = new URL(v);
    if (!['https:', 'http:'].includes(url.protocol))
        throw 1;
    return url.href;
}
catch {
    throw new ApiError('Tautan harus berupa URL http/https yang valid.');
} }
export function challengeFields(v) { const title = str(v.title, 3, 130, 'Judul'); const description = str(v.description, 8, 5000, 'Deskripsi'); const rules = str(v.rules, 5, 4000, 'Aturan'); const prize = str(v.prize, 2, 200, 'Hadiah'); const start = new Date(v.start_at); const end = new Date(v.end_at); if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start)
    throw new ApiError('Tanggal selesai harus setelah tanggal mulai.'); return { title, description, rules, prize, start_at: start.toISOString(), end_at: end.toISOString() }; }

