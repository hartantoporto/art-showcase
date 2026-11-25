import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { dateLabel } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
export const dynamic = 'force-dynamic';
export default async function MySubmissions() {
    const u = await requireRole('member');
    const { rows } = await query(`SELECT s.*,a.title artwork_title,ch.title challenge_title,ch.end_at,
 CASE WHEN NOW()>=ch.end_at THEN 'ended' WHEN NOW()<ch.start_at THEN 'upcoming' ELSE 'active' END phase
 FROM submissions s JOIN artworks a ON a.id=s.artwork_id JOIN challenges ch ON ch.id=s.challenge_id
 WHERE s.user_id=$1 ORDER BY s.submitted_at DESC`, [u.id]);
    return <DashboardShell role="member" user={u} title="My submissions" subtitle="Track all the creative challenges you&apos;ve joined."><div className="panel panel-pad table-wrap"><table className="data-table"><thead><tr><th>Challenge</th><th>Submitted artwork</th><th>Status</th><th>Prize rank</th><th>Ends</th></tr></thead><tbody>{rows.map(s => <tr key={s.id}><td><Link href={`/challenges/${s.challenge_id}`} className="font-bold hover:text-emerald-700">{s.challenge_title}</Link></td><td><Link href={`/artwork/${s.artwork_id}`} className="text-emerald-800">{s.artwork_title}</Link></td><td><span className={'status status-' + s.phase}>{s.phase}</span></td><td>{s.winner_rank ? `🏆 #${s.winner_rank}` : '—'}</td><td>{dateLabel(s.end_at)}</td></tr>)}</tbody></table>{!rows.length && <div className="empty mt-4">You haven&apos;t entered any challenges yet. Explore active challenges to participate.</div>}</div></DashboardShell>;
}

