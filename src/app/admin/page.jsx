import Link from 'next/link';
import { Users, Images, Flag, CalendarDays, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import DashboardShell from '@/components/DashboardShell';
export const dynamic = 'force-dynamic';
export default async function AdminHome() {
    const u = await requireRole('admin');
    const r = await query(`SELECT
 (SELECT COUNT(*)::int FROM users WHERE role='admin') admin_users,
 (SELECT COUNT(*)::int FROM users WHERE role='member') member_users,
 (SELECT COUNT(*)::int FROM users WHERE role='curator') curator_users,
 (SELECT COUNT(*)::int FROM artworks WHERE removed_at IS NULL) artworks,
 ((SELECT COUNT(*)::int FROM artwork_reports WHERE status='pending')+(SELECT COUNT(*)::int FROM comment_reports WHERE status='pending')) reports,
 (SELECT COUNT(*)::int FROM challenges WHERE NOW()>=start_at AND NOW()<end_at) active_challenges,
 (SELECT COUNT(*)::int FROM users WHERE role='curator' AND curator_status='pending') pending_curators`);
    const s = r.rows[0];
    return <DashboardShell role="admin" user={u} title="Control room" subtitle="Real-time platform overview from PostgreSQL aggregate queries."><div className="metric-grid">{[['Total users', s.admin_users + s.member_users + s.curator_users, Users], ['Published art', s.artworks, Images], ['Pending reports', s.reports, Flag], ['Active challenges', s.active_challenges, CalendarDays]].map(([n, v, I]) => <div key={n} className="metric"><I size={20} className="text-emerald-700"/><div className="metric-number mt-4">{v}</div><div className="text-xs muted mt-1">{n}</div></div>)}</div><div className="grid sm:grid-cols-2 gap-4 mt-6"><div className="panel panel-pad"><h2 className="subhead">Users by role</h2><div className="flex gap-2 flex-wrap mt-4"><span className="tag">Admin: {s.admin_users}</span><span className="tag">Members: {s.member_users}</span><span className="tag">Curators: {s.curator_users}</span></div><Link href="/admin/users" className="text-emerald-800 text-sm font-bold inline-flex gap-2 mt-5">Manage users <ArrowUpRight size={15}/></Link></div><div className="panel panel-pad"><h2 className="subhead">Needs your attention</h2><p className="text-sm mt-4"><strong className="text-emerald-800">{s.pending_curators}</strong> Curator requests waiting</p><p className="text-sm mt-2"><strong className="text-emerald-800">{s.reports}</strong> Reports in moderation queue</p><div className="flex gap-3 mt-5 text-emerald-800 font-bold text-xs"><Link href="/admin/curators">Review curators ↗</Link><Link href="/admin/moderation">Moderate content ↗</Link></div></div></div><div className="panel panel-pad mt-5 bg-emerald-50"><div className="eyebrow">SECURE PLATFORM</div><h2 className="font-bold mt-2">Admin operations are validated on the server.</h2><p className="text-sm muted mt-2 leading-6">Only Admin can approve Curators, manage users/categories, and dismiss or take down reported content.</p></div></DashboardShell>;
}

