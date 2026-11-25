'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ImagePlus, Calendar } from 'lucide-react';

// FORM CHALLENGE: Curator mengisi detail, aturan, hadiah, periode, dan banner.
export default function ChallengeForm({ challenge }) {
    const [busy, setBusy] = useState(false), [error, setError] = useState(''), [file, setFile] = useState(null);
    const router = useRouter();
    const toLocal = (iso) => { if (!iso)
        return ''; const d = new Date(iso); const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); };
    async function submit(e) { e.preventDefault(); setBusy(true); setError(''); try {
        const form = new FormData(e.currentTarget);
        for (const field of ['start_at', 'end_at'])
            form.set(field, new Date(form.get(field)).toISOString());
        const path = challenge ? `/api/challenges/${challenge.id}` : '/api/challenges';
        const r = await fetch(path, { method: challenge ? 'PATCH' : 'POST', body: form });
        const d = await r.json();
        if (!r.ok)
            throw Error(d.error);
        router.push('/curator/challenges');
        router.refresh();
    }
    catch (e) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <form className="panel panel-pad grid gap-5 max-w-[780px]" onSubmit={submit}><div className="font-bold text-lg">Challenge information</div><div className="field"><label htmlFor="title">Challenge title *</label><input id="title" name="title" className="input" required minLength={3} maxLength={130} defaultValue={challenge?.title || ''} placeholder="Beyond the Imaginary"/></div><div className="field"><label htmlFor="description">Description *</label><textarea id="description" name="description" className="input textarea" minLength={8} required defaultValue={challenge?.description || ''} placeholder="Inspire creatives with a bold theme..."/></div><div className="field"><label htmlFor="rules">Rules & guidelines *</label><textarea id="rules" name="rules" className="input textarea" minLength={5} required defaultValue={challenge?.rules || ''} placeholder="Allowed media, eligibility, judging criteria..."/></div><div className="field"><label htmlFor="prize">Prizes *</label><input id="prize" name="prize" className="input" required minLength={2} maxLength={200} defaultValue={challenge?.prize || ''} placeholder="e.g. Featured Spotlight + Digital Certificate"/></div><div className="field-grid"><div className="field"><label htmlFor="start_at">Start date & time *</label><input id="start_at" name="start_at" className="input" type="datetime-local" required defaultValue={toLocal(challenge?.start_at)}/></div><div className="field"><label htmlFor="end_at">End date & time *</label><input id="end_at" name="end_at" className="input" type="datetime-local" required defaultValue={toLocal(challenge?.end_at)}/></div></div><div className="field"><label htmlFor="banner">Banner image {challenge ? '(optional update)' : '*'}</label><input id="banner" name="banner" className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!challenge} onChange={e => setFile(e.target.files?.[0])}/><p className="text-xs muted">JPG, PNG, WEBP or GIF · max. 8 MB. {challenge && 'Leave blank to keep the current banner.'}</p></div>{error && <div className="alert-error">{error}</div>}<button disabled={busy} className="pill pill-primary w-fit">{busy ? 'Saving...' : challenge ? 'Update challenge' : 'Publish challenge'} <ArrowUpRight size={16}/></button></form>;
}

