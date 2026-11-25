import { getDatabaseUrl } from '../src/lib/database-url.mjs';
try {
    const parsed = new URL(getDatabaseUrl());
    const databaseName = decodeURIComponent(parsed.pathname.substring(1));
    if (databaseName !== 'spektra_db') throw new Error('Nama database harus spektra_db.');
    console.log('Format koneksi database valid.');
    console.log('Host:', parsed.hostname);
    console.log('Port:', parsed.port || '5432 (default)');
    console.log('Database:', databaseName);
    console.log('User:', decodeURIComponent(parsed.username));
    console.log('Password tidak ditampilkan.');
    console.log('Untuk menguji koneksi sebenarnya, jalankan: npm.cmd run db:setup');
}
catch (error) {
    console.error('Konfigurasi database belum benar:', error.message);
    process.exitCode = 1;
}

