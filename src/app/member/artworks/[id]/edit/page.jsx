import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { getCategories, oneArtwork } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import ArtworkForm from '@/components/ArtworkForm';
export const dynamic = 'force-dynamic';
export default async function EditArtwork({ params }) { const u = await requireRole('member'); const { id } = await params; const [cats, a] = await Promise.all([getCategories(), oneArtwork(id, u.id)]); if (!a || String(a.user_id) !== String(u.id))
    notFound(); return <DashboardShell role="member" user={u} title="Edit artwork" subtitle="Update the story, category, country or tags. The original media stays unchanged."><div className="max-w-[760px]"><ArtworkForm categories={cats} art={a}/></div></DashboardShell>; }

