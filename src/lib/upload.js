import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { ApiError } from './auth';

// UPLOAD MEDIA: validasi tipe file dan penyimpanan lokal berdasarkan jenis media.
const MIME = {
    'image/jpeg': ['jpg', 'images'], 'image/png': ['png', 'images'], 'image/webp': ['webp', 'images'], 'image/gif': ['gif', 'images'],
    'audio/mpeg': ['mp3', 'audio'], 'audio/wav': ['wav', 'audio'], 'audio/ogg': ['ogg', 'audio'],
    'video/mp4': ['mp4', 'videos'], 'video/webm': ['webm', 'videos'],
    'application/pdf': ['pdf', 'documents'],
};
// Upload lokal untuk demonstrasi tugas; file disimpan terpisah menurut jenis media.
export async function saveUpload(file, { imageOnly = false, maxMB = 15 } = {}) {
    if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0)
        throw new ApiError('File upload wajib diisi.');
    if (file.size > maxMB * 1024 * 1024)
        throw new ApiError(`Ukuran file maksimal ${maxMB} MB.`);
    const type = MIME[file.type];
    if (!type || (imageOnly && type[1] !== 'images'))
        throw new ApiError('Tipe media tidak didukung. Gunakan JPG, PNG, WEBP, GIF, MP3, WAV, OGG, MP4, WEBM, atau PDF.');
    const buffer = Buffer.from(await file.arrayBuffer());
    const valid = {
        'image/jpeg': () => buffer[0] === 0xff && buffer[1] === 0xd8,
        'image/png': () => buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
        'image/webp': () => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
        'image/gif': () => buffer.toString('ascii', 0, 3) === 'GIF',
        'application/pdf': () => buffer.toString('ascii', 0, 5) === '%PDF-',
        'audio/mpeg': () => buffer.toString('ascii', 0, 3) === 'ID3' || buffer[0] === 0xff,
        'audio/wav': () => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WAVE',
        'audio/ogg': () => buffer.toString('ascii', 0, 4) === 'OggS',
        'video/mp4': () => buffer.toString('ascii', 4, 8) === 'ftyp',
        'video/webm': () => buffer.subarray(0, 4).equals(Buffer.from('1a45dfa3', 'hex')),
    };
    if (!valid[file.type]())
        throw new ApiError('Isi file tidak sesuai dengan tipe yang dipilih.');
    const name = `${randomUUID()}.${type[0]}`;
    const folder = type[1];
    const destination = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(destination, { recursive: true });
    await writeFile(path.join(destination, name), buffer, { flag: 'wx' });
    return { url: `/uploads/${folder}/${name}`, media_type: folder === 'images' ? 'image' : folder === 'videos' ? 'video' : folder === 'audio' ? 'audio' : 'document', original_filename: String(file.name || 'upload').slice(0, 180) };
}
export async function removeLocalUpload(url) {
    if (typeof url !== 'string' || !/^\/uploads\/(?:images|audio|videos|documents)\/[a-f0-9-]+\.(?:jpg|png|webp|gif|mp3|wav|ogg|mp4|webm|pdf)$/.test(url))
        return;
    try {
        await unlink(path.join(process.cwd(), 'public', url.replace(/^\//, '')));
    }
    catch { }
}

