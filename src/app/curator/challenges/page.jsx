import Link from 'next/link';
import { Pencil, Plus, Users } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { listChallenges, dateLabel } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import { DeleteChallenge } from '@/components/CuratorChallengeTools';
export const dynamic = 'force-dynamic';
export default async function MyChallenges() { const u = await requireRole('curator'); const ch = await listChallenges({ curatorId: u.id, limit: 100 }); return <DashboardShell role="curator" user={u} title="Manage challenges" subtitle="Design competitions, manage submissions, and select winners."><div className="flex justify-end mb-5"><Link href="/curator/challenges/new" className="pill pill-primary"><Plus size={16}/> New challenge</Link></div><div className="panel panel-pad table-wrap"><table className="data-table"><thead><tr><th>Challenge</th><th>Phase</th><th>Entries</th><th>Deadline</th><th>Actions</th></tr></thead><tbody>{ch.map(c => <tr key={c.id}><td><Link className="font-bold hover:text-emerald-700" href={`/challenges/${c.id}`}>{c.title}</Link></td><td><span className={'status status-' + c.phase}>{c.phase}</span></td><td>{c.submission_count}</td><td>{dateLabel(c.end_at)}</td><td><div className="flex flex-wrap gap-2"><Link href={`/curator/challenges/${c.id}/submissions`} className="btn-small"><Users size={13}/> Entries</Link><Link href={`/curator/challenges/${c.id}/edit`} className="btn-small"><Pencil size={13}/> Edit</Link><DeleteChallenge id={c.id}/></div></td></tr>)}</tbody></table>{!ch.length && <div className="empty mt-4">You haven&apos;t published any challenges yet.</div>}</div></DashboardShell>; }

