import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { oneChallenge } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import ChallengeForm from '@/components/ChallengeForm';
export const dynamic = 'force-dynamic';
export default async function EditChallenge({ params }) { const u = await requireRole('curator'); const { id } = await params; const ch = await oneChallenge(id); if (!ch || String(ch.curator_id) !== String(u.id))
    notFound(); return <DashboardShell role="curator" user={u} title="Edit challenge" subtitle="Update your competition details and banner."><ChallengeForm challenge={ch}/></DashboardShell>; }

