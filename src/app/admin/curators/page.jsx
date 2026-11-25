import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { dateLabel } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import { CuratorReview } from '@/components/AdminControls';
export const dynamic = 'force-dynamic';
export default async function Curators() { const u = await requireRole('admin'); const { rows } = await query("SELECT id,name,handle,email,created_at FROM users WHERE role='curator' AND curator_status='pending' ORDER BY created_at ASC"); return <DashboardShell role="admin" user={u} title="Curator verification" subtitle="Approve or reject new curator registrations."><div className="panel panel-pad table-wrap"><table className="data-table"><thead><tr><th>Applicant</th><th>Email</th><th>Requested</th><th>Decision</th></tr></thead><tbody>{rows.map(c => <tr key={c.id}><td><div className="font-bold">{c.name}</div><div className="text-xs muted">@{c.handle}</div></td><td>{c.email}</td><td>{dateLabel(c.created_at)}</td><td><CuratorReview userId={c.id}/></td></tr>)}</tbody></table>{!rows.length && <div className="empty mt-4">All caught up! No pending curator applications.</div>}</div></DashboardShell>; }

