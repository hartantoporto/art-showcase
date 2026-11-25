import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { getDatabaseUrl } from '../src/lib/database-url.mjs';
const { Pool } = pg;
const pool = new Pool({ connectionString: getDatabaseUrl(), connectionTimeoutMillis: 8000 });
try {
    const sql = await readFile(new URL('../database/spektra.sql', import.meta.url), 'utf8');
    await pool.query(sql);
    console.log('✓ Database SPEKTRA siap: tabel, relasi, constraint, indeks, migrasi metadata karya, 10 kategori, dan progres petualangan berhasil dipasang.');
}
catch (error) {
    console.error('Database setup gagal:', error.message);
    process.exitCode = 1;
}
finally {
    await pool.end();
}

