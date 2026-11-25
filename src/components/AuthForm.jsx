'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Eye, EyeOff, UserRound, Building2 } from 'lucide-react';

// AUTENTIKASI: form login dan registrasi untuk akun Member, Curator, dan Admin.
export default function AuthForm({ mode }) {
    const router = useRouter(), sp = useSearchParams(), [role, setRole] = useState(sp.get('role') === 'curator' ? 'curator' : 'member'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [show, setShow] = useState(false);
    async function submit(e) { e.preventDefault(); setBusy(true); setError(''); const form = new FormData(e.currentTarget); const values = Object.fromEntries(form); const data = { op: mode, ...values, ...(mode === 'register' ? { role } : {}) }; try {
        const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const d = await r.json();
        if (!r.ok)
            throw Error(d.error || 'Failed to authenticate.');
        const next = sp.get('next');
        const safeNext = next && /^\/(?!\/)[A-Za-z0-9_/?=&%.-]*$/.test(next) && d.redirect === '/member';
        router.push(mode === 'login' && safeNext ? next : d.redirect);
        router.refresh();
    }
    catch (e) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <div className="auth-panel fade-in"><Link href="/" className="eyebrow">✳ SPEKTRA COMMUNITY</Link><h1 className="serif text-[clamp(37px,4vw,56px)] leading-tight mt-3">{mode === 'register' ? <>Start your <span className="gradient-text">creative journey.</span></> : <>Welcome <span className="gradient-text">back.</span></>}</h1><p className="muted text-sm mt-3 mb-8">{mode === 'register' ? 'Create an account to join a universe of imagination.' : 'Your creative universe is waiting for you.'}</p>
 {mode === 'register' && <div className="grid grid-cols-2 gap-3 mb-6"><button type="button" className={'panel text-left p-4 ' + (role === 'member' ? '!border-emerald-500 !bg-emerald-50' : '')} onClick={() => setRole('member')}><UserRound size={20} className="text-emerald-700 mb-2"/><strong className="block text-sm">I am an Artist</strong><span className="text-xs muted">Showcase & interact</span></button><button type="button" className={'panel text-left p-4 ' + (role === 'curator' ? '!border-emerald-500 !bg-emerald-50' : '')} onClick={() => setRole('curator')}><Building2 size={20} className="text-emerald-700 mb-2"/><strong className="block text-sm">I am a Curator</strong><span className="text-xs muted">Host challenges</span></button></div>}
 <form onSubmit={submit} className="grid gap-4">{mode === 'register' && <><div className="field"><label htmlFor="name">Full name / Organization</label><input required minLength={2} maxLength={90} className="input" name="name" id="name" placeholder="e.g. Alex Rivera"/></div><div className="field"><label htmlFor="handle">Username</label><input required minLength={3} maxLength={40} pattern="[a-z0-9_]+" className="input" name="handle" id="handle" placeholder="alexcreates"/></div></>}<div className="field"><label htmlFor="email">Email address</label><input type="email" required className="input" name="email" id="email" placeholder="you@example.com"/></div><div className="field"><label htmlFor="password">Password</label><div className="relative"><input type={show ? 'text' : 'password'} required minLength={mode === 'register' ? 8 : 1} name="password" id="password" className="input pr-10" placeholder="At least 8 characters"/><button type="button" className="absolute right-3 top-3.5 muted" onClick={() => setShow(!show)} aria-label="Toggle password visibility">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>{role === 'curator' && mode === 'register' && <p className="text-xs muted bg-emerald-50 p-3 rounded-lg">Curator accounts require Admin approval before dashboard access.</p>}{error && <div role="alert" className="alert-error">{error}</div>}<button disabled={busy} type="submit" className="pill pill-primary w-full !py-4">{busy ? 'Please wait...' : mode === 'register' ? 'Create my account' : 'Sign in'} <ArrowUpRight size={16}/></button></form><p className="text-sm text-center muted mt-6">{mode === 'register' ? <>Already have an account? <Link className="font-bold text-emerald-800" href="/login">Sign in</Link></> : <>New to SPEKTRA? <Link className="font-bold text-emerald-800" href="/register">Create an account</Link></>}</p><Link href="/" className="block text-center text-xs muted mt-5">Continue exploring as Guest ↗</Link></div>;
}

