import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DashboardShell from '@/components/DashboardShell';
import { ModerationReview } from '@/components/AdminControls';
export const dynamic = 'force-dynamic';
export default async function Moderation() {
    const u = await requireRole('admin');
    const [a, c] = await Promise.all([
        query(`SELECT a.id artwork_id,a.title,a.media_url,a.media_type,u.name creator,
 COUNT(r.id)::int report_count,STRING_AGG(DISTINCT r.reason,', ') reasons
 FROM artwork_reports r JOIN artworks a ON a.id=r.artwork_id JOIN users u ON u.id=a.user_id
 WHERE r.status='pending' GROUP BY a.id,u.name ORDER BY report_count DESC,a.id DESC`),
        query(`SELECT c.id comment_id,c.body,a.title artwork_title,u.name author,
 COUNT(r.id)::int report_count,STRING_AGG(DISTINCT r.reason,', ') reasons
 FROM comment_reports r JOIN comments c ON c.id=r.comment_id JOIN artworks a ON a.id=c.artwork_id JOIN users u ON u.id=c.user_id
 WHERE r.status='pending' GROUP BY c.id,a.title,u.name ORDER BY report_count DESC`)
    ]);
    return <DashboardShell role="admin" user={u} title="Moderation queue" subtitle="Review flagged artworks and comments, then dismiss reports or take down content."><h2 className="subhead mb-4">Artwork reports ({a.rows.length} artworks)</h2><div className="grid gap-4">{a.rows.map(r => <div className="panel panel-pad flex flex-wrap gap-5" key={r.artwork_id}><Link href={`/artwork/${r.artwork_id}`} className="w-24 h-24 bg-emerald-100 rounded-xl overflow-hidden">{r.media_type === 'image' ? <img src={r.media_url} alt={r.title} className="w-full h-full object-cover"/> : <div className="media-placeholder text-xs">{r.media_type}</div>}</Link><div className="flex-1 min-w-[180px]"><Link href={`/artwork/${r.artwork_id}`} className="font-bold hover:text-emerald-800">{r.title}</Link><p className="text-xs muted mt-1">By {r.creator} · {r.report_count} reports</p><p className="text-sm mt-2">Reasons: {r.reasons}</p><div className="mt-4"><ModerationReview id={r.artwork_id} type="artwork"/></div></div></div>)}{!a.rows.length && <div className="empty mb-7">No pending artwork reports.</div>}</div><h2 className="subhead mt-9 mb-4">Comment reports ({c.rows.length} comments)</h2><div className="grid gap-4">{c.rows.map(r => <div className="panel panel-pad" key={r.comment_id}><div className="font-bold text-sm">{r.author} on {r.artwork_title} · {r.report_count} reports</div><p className="text-sm mt-3 bg-emerald-50 rounded-xl p-3">“{r.body}”</p><p className="text-xs muted mt-2">Reasons: {r.reasons}</p><div className="mt-4"><ModerationReview id={r.comment_id} type="comment"/></div></div>)}{!c.rows.length && <div className="empty">No pending comment reports.</div>}</div></DashboardShell>;
}

