import { requireRole } from '@/lib/auth';
import { listArtworks } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import ArtworkGrid from '@/components/ArtworkGrid';

export const dynamic = 'force-dynamic';

export default async function Favorites() {
  const user = await requireRole('member');
  const artworks = await listArtworks({
    userId: user.id,
    favoritesOnly: true,
    limit: 100,
    sort: 'latest',
  });

  return (
    <DashboardShell
      role="member"
      user={user}
      title="Saved favorites"
      subtitle="Artworks that have a special place in your heart."
    >
      <ArtworkGrid
        items={artworks}
        user={user}
        empty="Bookmark works you love and they'll appear here."
      />
    </DashboardShell>
  );
}
