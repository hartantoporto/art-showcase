import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { oneChallenge, submissionsFor } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import { WinnerSelect } from '@/components/CuratorChallengeTools';
export const dynamic = 'force-dynamic';
export default async function ManageEntries({ params }) { const u = await requireRole('curator'); const { id } = await params; const ch = await oneChallenge(id); if (!ch || String(ch.curator_id) !== String(u.id))
    notFound(); const entries = await submissionsFor(id); const canPick = ch.phase === 'ended'; return <DashboardShell role="curator" user={u} title="Review submissions" subtitle={`${ch.title} · ${entries.length} entries`}><div className={canPick ? 'alert-success mb-5' : 'alert-error mb-5'}>{canPick ? 'Challenge ended. You can now select up to three winners (unique rank per artwork).' : 'Winner selection is locked until the challenge end date. Backend validates this too.'}</div><div className="grid gap-4">{entries.map(s => <article key={s.id} className="panel panel-pad flex flex-wrap items-center gap-5"><Link href={`/artwork/${s.artwork_id}`} className="w-28 h-24 overflow-hidden rounded-xl bg-emerald-100">{s.media_type === 'image' ? <img className="w-full h-full object-cover" src={s.media_url} alt={s.artwork_title}/> : <div className="media-placeholder text-xs">{s.media_type}</div>}</Link><div className="flex-1 min-w-[140px]"><Link href={`/artwork/${s.artwork_id}`} className="font-bold hover:text-emerald-700">{s.artwork_title}</Link><p className="text-xs muted mt-1">by {s.creator_name}</p><p className="text-xs muted mt-1">{new Date(s.submitted_at).toLocaleDateString()}</p></div><WinnerSelect challengeId={ch.id} submission={s} canPick={canPick}/></article>)}{!entries.length && <div className="empty">No submissions have been received yet.</div>}</div></DashboardShell>; }

