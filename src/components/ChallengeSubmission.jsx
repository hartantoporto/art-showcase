'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Undo2 } from 'lucide-react';

// SUBMISI CHALLENGE: Member memilih karya portofolio untuk dikirim ke challenge.
export default function ChallengeSubmission({ challenge, artworks, existing, user }) {
    const [choice, setChoice] = useState(''), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
    const router = useRouter();
    if (user?.role !== 'member')
        return <div className="text-xs muted">{user ? 'Only Members can enter challenges.' : 'Log in as Member to submit your art.'}</div>;
    if (challenge.phase === 'upcoming')
        return <p className="text-sm muted">Submissions open when this challenge begins.</p>;
    if (challenge.phase === 'ended')
        return <p className="text-sm muted">The submission window has closed.</p>;
    async function act(op) { setBusy(true); setMsg(''); try {
        const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op, challenge_id: challenge.id, artwork_id: choice }) });
        const d = await r.json();
        if (!r.ok)
            throw Error(d.error);
        router.refresh();
    }
    catch (e) {
        setMsg(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <div className="panel panel-pad mt-4"><h3 className="font-bold mb-3">{existing ? 'You are participating!' : 'Submit your artwork'}</h3>{existing ? <><p className="text-sm muted mb-4">You submitted one artwork. You can withdraw it before the challenge ends.</p><button className="pill pill-secondary" disabled={busy} onClick={() => { if (confirm('Withdraw your submission?'))
        act('withdraw'); }}><Undo2 size={16}/> Withdraw submission</button></> : <><p className="text-xs muted mb-3">Choose ONE artwork from your portfolio.</p><select className="input" value={choice} onChange={e => setChoice(e.target.value)}><option value="">Select my artwork...</option>{artworks.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select><button disabled={!choice || busy} className="pill pill-primary mt-3" onClick={() => act('submit')}><UploadCloud size={16}/> Submit your work</button>{!artworks.length && <a className="block text-emerald-700 text-xs mt-2" href="/member/artworks/new">Create an artwork first ↗</a>}</>}{msg && <div className="alert-error mt-3">{msg}</div>}</div>;
}

