/**
 * Validate the local/production PostgreSQL connection string before pg tries
 * to negotiate SCRAM authentication. This turns the vague
 * "client password must be a string" error into an actionable message.
 */
export function getDatabaseUrl() {
    const value = process.env.DATABASE_URL?.trim();
    if (!value) {
        throw new Error('[SPEKTRA DB CONFIG] DATABASE_URL belum diatur. Buka .env.local dan isi password role PostgreSQL milikmu.');
    }
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        throw new Error('[SPEKTRA DB CONFIG] Format DATABASE_URL tidak valid. Gunakan postgresql://USER:PASSWORD@HOST:5432/NAMA_DATABASE.');
    }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
        throw new Error('[SPEKTRA DB CONFIG] DATABASE_URL harus menggunakan protokol postgresql://.');
    }
    if (!parsed.hostname || !parsed.pathname || parsed.pathname === '/') {
        throw new Error('[SPEKTRA DB CONFIG] DATABASE_URL harus mencantumkan host dan nama database.');
    }
    if (!parsed.password || ['CHANGE_ME', 'YOUR_PASSWORD', 'ISI_PASSWORD', 'ISI_PASSWORD_POSTGRES_KAMU'].includes(parsed.password)) {
        throw new Error('[SPEKTRA DB CONFIG] Password PostgreSQL belum diisi. Buka .env.local dan ganti nilai placeholder dengan password role PostgreSQL milikmu.');
    }
    return value;
}

