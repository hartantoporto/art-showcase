'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Crown } from 'lucide-react';

// TOOLS CURATOR: mengelola challenge dan meninjau karya peserta.
export function DeleteChallenge({ id }) { const [busy, setBusy] = useState(false); const router = useRouter(); async function remove() { if (!confirm('Delete the challenge and all entries permanently?'))
    return; setBusy(true); try {
    const r = await fetch(`/api/challenges/${id}`, { method: 'DELETE' });
    const d = await r.json();
    if (!r.ok)
        throw Error(d.error);
    router.refresh();
}
catch (e) {
    alert(e.message);
}
finally {
    setBusy(false);
} } return <button className="btn-small btn-danger" onClick={remove} disabled={busy}><Trash2 size={13}/> Delete</button>; }
export function WinnerSelect({ challengeId, submission, canPick }) { const [rank, setRank] = useState(submission.winner_rank || ''), [busy, setBusy] = useState(false), [error, setError] = useState(''); const router = useRouter(); async function save() { setBusy(true); setError(''); try {
    const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'winner', challenge_id: challengeId, submission_id: submission.id, rank: rank || null }) });
    const d = await r.json();
    if (!r.ok)
        throw Error(d.error);
    router.refresh();
}
catch (e) {
    setError(e.message);
}
finally {
    setBusy(false);
} } return <div className="flex flex-wrap gap-2 items-center"><select value={rank} onChange={e => setRank(e.target.value)} className="input !w-[140px] !py-2" disabled={!canPick}><option value="">No rank</option><option value="1">🥇 1st place</option><option value="2">🥈 2nd place</option><option value="3">🥉 3rd place</option></select><button className="btn-small" onClick={save} disabled={!canPick || busy}><Crown size={13}/> Set winner</button>{error && <span className="text-red-500 text-xs">{error}</span>}</div>; }

