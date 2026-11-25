import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DashboardShell from '@/components/DashboardShell';
import MoodboardManager from '@/components/MoodboardManager';
export const dynamic = 'force-dynamic';
export default async function Collections() { const u = await requireRole('member'); const [a, b] = await Promise.all([query('SELECT * FROM collections WHERE user_id=$1 ORDER BY created_at DESC', [u.id]), query(`SELECT ci.collection_id,a.id artwork_id,a.title,a.media_url,a.media_type FROM collection_items ci JOIN collections c ON c.id=ci.collection_id JOIN artworks a ON a.id=ci.artwork_id WHERE c.user_id=$1 AND a.removed_at IS NULL`, [u.id])]); return <DashboardShell role="member" user={u} title="My moodboards" subtitle="Collect inspiration. Curate your own creative universe."><MoodboardManager collections={a.rows} items={b.rows}/></DashboardShell>; }

