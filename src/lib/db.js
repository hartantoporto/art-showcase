import pg from 'pg';
import { getDatabaseUrl } from './database-url.mjs';
const { Pool } = pg;
const globalForDb = globalThis;
function createPool() {
    const pool = new Pool({
        connectionString: getDatabaseUrl(),
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 8000,
        keepAlive: true,
    });
    pool.on('error', (error) => {
        console.error('[SPEKTRA PostgreSQL pool]', error.message);
    });
    return pool;
}
// Lazy initialization ensures a missing .env.local produces a clear message
// at first database use, instead of a low-level SCRAM password type error.
export function getPool() {
    if (!globalForDb.__spektraPool)
        globalForDb.__spektraPool = createPool();
    return globalForDb.__spektraPool;
}
export const query = (sql, params = []) => getPool().query(sql, params);
// TRANSAKSI DATABASE: gunakan BEGIN/COMMIT dan ROLLBACK untuk operasi yang saling terkait.
export async function transaction(fn) {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const value = await fn(client);
        await client.query('COMMIT');
        return value;
    }
    catch (error) {
        try {
            await client.query('ROLLBACK');
        }
        catch { /* preserve the original error */ }
        throw error;
    }
    finally {
        client.release();
    }
}

