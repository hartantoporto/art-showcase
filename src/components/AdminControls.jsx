'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2, X, ShieldAlert, Plus, Pencil } from 'lucide-react';

// KONTROL ADMIN: verifikasi Curator, kategori, akun, dan moderasi konten.
async function adminAction(body) { const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json(); if (!r.ok)
    throw Error(d.error || 'Operation failed.'); return d; }
export function DeleteUserButton({ userId }) { const [busy, setBusy] = useState(false), router = useRouter(); async function remove() { if (!confirm('Permanently delete user and their data?'))
    return; setBusy(true); try {
    await adminAction({ op: 'deleteUser', user_id: userId });
    router.refresh();
}
catch (e) {
    alert(e.message);
}
finally {
    setBusy(false);
} } return <button onClick={remove} disabled={busy} className="btn-small btn-danger"><Trash2 size={13}/> Delete</button>; }
export function CuratorReview({ userId }) { const [busy, setBusy] = useState(false), router = useRouter(); async function go(status) { const reason = status === 'rejected' ? prompt('Enter a rejection reason:', 'Application did not meet curator requirements.') : null; if (status === 'rejected' && reason === null)
    return; setBusy(true); try {
    await adminAction({ op: 'verify', user_id: userId, status, reason });
    router.refresh();
}
catch (e) {
    alert(e.message);
}
finally {
    setBusy(false);
} } return <div className="flex flex-wrap gap-2"><button disabled={busy} className="btn-small !bg-green-50 !text-green-700" onClick={() => go('approved')}><Check size={14}/> Approve</button><button disabled={busy} className="btn-small btn-danger" onClick={() => go('rejected')}><X size={14}/> Reject</button></div>; }
export function ModerationReview({ type, id }) { const [busy, setBusy] = useState(false), router = useRouter(); async function go(status) { if (!confirm(`Are you sure you want to ${status === 'dismissed' ? 'dismiss this report' : 'take down this content'}?`))
    return; setBusy(true); try {
    await adminAction({ op: type === 'artwork' ? 'moderateArtwork' : 'moderateComment', [type === 'artwork' ? 'artwork_id' : 'comment_id']: id, status });
    router.refresh();
}
catch (e) {
    alert(e.message);
}
finally {
    setBusy(false);
} } return <div className="flex gap-2 flex-wrap"><button className="btn-small" disabled={busy} onClick={() => go('dismissed')}><Check size={13}/> Dismiss report</button><button className="btn-small btn-danger" disabled={busy} onClick={() => go('taken_down')}><ShieldAlert size={13}/> Take down</button></div>; }
export function CategoryManager({ categories }) {
    const router = useRouter(), [editing, setEditing] = useState(null), [name, setName] = useState(''), [icon, setIcon] = useState('✦'), [color, setColor] = useState('#AB92FF'), [busy, setBusy] = useState(false), [err, setErr] = useState('');
    function edit(c) { setEditing(c); setName(c?.name || ''); setIcon(c?.icon || '✦'); setColor(c?.color || '#AB92FF'); setErr(''); }
    async function save(e) { e.preventDefault(); setBusy(true); setErr(''); try {
        await adminAction({ op: editing ? 'categoryEdit' : 'categoryCreate', ...(editing ? { category_id: editing.id } : {}), name, icon, color });
        edit(null);
        router.refresh();
    }
    catch (e) {
        setErr(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function remove(c) { if (!confirm(`Delete category "${c.name}"? This will fail if artworks still use it.`))
        return; setBusy(true); try {
        await adminAction({ op: 'categoryDelete', category_id: c.id });
        router.refresh();
    }
    catch (e) {
        alert(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{categories.map(c => <div className="panel p-5 flex gap-3 items-center" key={c.id}><div className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl" style={{ background: c.color + '55' }}>{c.icon}</div><div className="flex-1 min-w-0"><div className="font-extrabold text-sm truncate">{c.name}</div><div className="muted text-xs mt-1">{c.slug}</div></div><div className="flex gap-2"><button className="btn-small" onClick={() => edit(c)} title="Edit"><Pencil size={14}/></button><button className="btn-small btn-danger" onClick={() => remove(c)} disabled={busy} title="Delete"><Trash2 size={14}/></button></div></div>)}</div><form className="panel panel-pad mt-7 grid gap-4 max-w-[720px]" onSubmit={save}><div className="flex justify-between"><h2 className="subhead">{editing ? 'Edit category' : 'Add an art category'}</h2>{editing && <button type="button" className="text-xs muted" onClick={() => edit(null)}>Cancel editing</button>}</div><div className="field"><label htmlFor="name">Unique category name</label><input id="name" required minLength={2} maxLength={70} className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Street Art"/></div><div className="field-grid"><div className="field"><label htmlFor="icon">Emoji/symbol</label><input id="icon" className="input" value={icon} maxLength={10} onChange={e => setIcon(e.target.value)}/></div><div className="field"><label htmlFor="color">Accent color</label><input id="color" type="color" className="input h-[49px]" value={color} onChange={e => setColor(e.target.value)}/></div></div>{err && <div className="alert-error">{err}</div>}<button disabled={busy} className="pill pill-primary w-fit"><Plus size={15}/>{editing ? 'Save category' : 'Create category'}</button></form></>;
}

