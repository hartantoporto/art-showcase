import { requireRole } from '@/lib/auth';
import { getCategories } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import ArtworkForm from '@/components/ArtworkForm';

export const dynamic = 'force-dynamic';

export default async function NewArtwork() {
  const user = await requireRole('member');
  const categories = await getCategories();

  return (
    <DashboardShell
      role="member"
      user={user}
      title="Upload your art"
      subtitle="Let your creativity travel across borders."
    >
      <div className="max-w-[760px]">
        <ArtworkForm categories={categories} />
      </div>
    </DashboardShell>
  );
}
