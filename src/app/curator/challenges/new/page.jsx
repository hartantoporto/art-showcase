import { requireRole } from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ChallengeForm from '@/components/ChallengeForm';

export const dynamic = 'force-dynamic';

export default async function NewChallenge() {
  const user = await requireRole('curator');

  return (
    <DashboardShell
      role="curator"
      user={user}
      title="Create a challenge"
      subtitle="Set a theme, define the rules, and invite artists to show what they can do."
    >
      <ChallengeForm />
    </DashboardShell>
  );
}
