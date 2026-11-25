import Link from 'next/link';
import { CalendarDays, Plus, Trophy, Users, ArrowUpRight } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { listChallenges } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import ChallengeCard from '@/components/ChallengeCard';
export const dynamic = 'force-dynamic';
export default async function CuratorHome() {
    const u = await requireRole('curator');
    const [r, challenges] = await Promise.all([query(`SELECT COUNT(*)::int challenges,COUNT(*) FILTER(WHERE NOW()>=start_at AND NOW()<end_at)::int active,
 (SELECT COUNT(*)::int FROM submissions s JOIN challenges ch ON ch.id=s.challenge_id WHERE ch.curator_id=$1) entries FROM challenges WHERE curator_id=$1`, [u.id]), listChallenges({ curatorId: u.id, limit: 3 })]);
    const s = r.rows[0];
    return <DashboardShell role="curator" user={u} title="Curator studio" subtitle="Create bold challenges and discover the next creative voices."><div className="metric-grid">{[['My challenges', s.challenges, CalendarDays], ['Active now', s.active, Trophy], ['Total entries', s.entries, Users]].map(([n, v, I]) => <div className="metric" key={n}><I size={20} className="text-emerald-700"/><div className="metric-number mt-4">{v}</div><p className="text-xs muted mt-1">{n}</p></div>)}</div><div className="mt-7 flex justify-between flex-wrap gap-3"><h2 className="subhead">Your challenges</h2><Link href="/curator/challenges/new" className="pill pill-primary"><Plus size={16}/> Create challenge</Link></div><div className="challenge-grid mt-5">{challenges.map(c => <ChallengeCard challenge={c} key={c.id}/>)}</div>{!challenges.length && <div className="empty mt-5">Create your first challenge to inspire the world.</div>}<Link href="/curator/challenges" className="text-emerald-800 text-sm font-bold inline-block mt-5">Manage all challenges <ArrowUpRight size={14} className="inline"/></Link></DashboardShell>;
}

