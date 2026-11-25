import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { dateLabel } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import { DeleteUserButton } from '@/components/AdminControls';
export const dynamic = 'force-dynamic';
export default async function Users({ searchParams }) { const u = await requireRole('admin'), sp = await searchParams; const role = ['admin', 'member', 'curator'].includes(sp.role) ? sp.role : ''; const { rows } = await query(`SELECT id,name,handle,email,role,curator_status,created_at FROM users WHERE ($1::text='' OR role=$1) ORDER BY created_at DESC`, [role]); return <DashboardShell role="admin" user={u} title="User management" subtitle="View all users and manage Member/Curator accounts."><form method="get" className="flex gap-2 mb-5"><select className="input max-w-[240px]" name="role" defaultValue={role}><option value="">All roles</option><option value="admin">Admin</option><option value="member">Member</option><option value="curator">Curator</option></select><button className="pill pill-primary">Filter</button></form><div className="panel panel-pad table-wrap"><table className="data-table"><thead><tr><th>Person</th><th>Email</th><th>Role</th><th>Curator status</th><th>Joined</th><th>Action</th></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td><div className="font-bold">{p.name}</div><div className="text-xs muted">@{p.handle}</div></td><td>{p.email}</td><td><span className="tag">{p.role}</span></td><td>{p.curator_status || '—'}</td><td>{dateLabel(p.created_at)}</td><td>{p.role === 'admin' ? <span className="text-xs muted">Protected</span> : <DeleteUserButton userId={p.id}/>}</td></tr>)}</tbody></table></div></DashboardShell>; }

