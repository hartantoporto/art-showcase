import { requireRole } from '@/lib/auth';
import { getCategories } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import { CategoryManager } from '@/components/AdminControls';

export const dynamic = 'force-dynamic';

export default async function Categories() {
  const user = await requireRole('admin');
  const categories = await getCategories();

  return (
    <DashboardShell
      role="admin"
      user={user}
      title="Art categories"
      subtitle="Manage the creative disciplines available in the showcase."
    >
      <CategoryManager categories={categories} />
    </DashboardShell>
  );
}
