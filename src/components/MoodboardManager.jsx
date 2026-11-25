'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, X, BookHeart } from 'lucide-react';

// MOODBOARD: membuat koleksi dan mengatur karya favorit dalam koleksi Member.
export default function MoodboardManager({ collections, items }) { const [name, setName] = useState(''), [description, setDescription] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''); const router = useRouter(); async function act(data) { setBusy(true); setError(''); try {
    const r = await fetch('/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const d = await r.json();
    if (!r.ok)
        throw Error(d.error);
    setName('');
    setDescription('');
    router.refresh();
}
catch (e) {
    setError(e.message);
}
finally {
    setBusy(false);
} } return <><form className="panel panel-pad mb-6" onSubmit={e => { e.preventDefault(); act({ op: 'create', name, description }); }}><h3 className="subhead">Create a moodboard</h3><p className="muted text-xs mt-1 mb-4">Group your favorite artworks into a visual inspiration collection.</p><div className="field-grid"><div className="field"><label>Name *</label><input className="input" required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Dreamy Color Palette"/></div><div className="field"><label>Description</label><input className="input" maxLength={300} value={description} onChange={e => setDescription(e.target.value)} placeholder="Art that inspires my next project"/></div></div>{error && <div className="alert-error mt-4">{error}</div>}<button disabled={busy} className="pill pill-primary mt-4"><Plus size={16}/> Create moodboard</button></form>{collections.length ? collections.map(c => <div key={c.id} className="panel panel-pad mb-5"><div className="flex justify-between gap-2 items-center"><div><h3 className="font-bold text-lg">{c.name}</h3><p className="text-xs muted mt-1">{c.description || 'Personal inspiration board'}</p></div><button className="btn-small btn-danger" disabled={busy} onClick={() => { if (confirm('Delete this moodboard?'))
    act({ op: 'delete', collection_id: c.id }); }}><Trash2 size={13}/> Delete</button></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">{(items.filter(i => String(i.collection_id) === String(c.id))).map(i => <div key={i.artwork_id} className="relative"><Link href={`/artwork/${i.artwork_id}`} className="block aspect-square rounded-xl overflow-hidden bg-emerald-100">{i.media_type === 'image' ? <img src={i.media_url} alt={i.title} className="w-full h-full object-cover"/> : <div className="media-placeholder">{i.media_type}</div>}</Link><button onClick={() => act({ op: 'remove', collection_id: c.id, artwork_id: i.artwork_id })} aria-label="Remove from moodboard" className="absolute top-2 right-2 bg-white rounded-full p-1"><X size={14}/></button><div className="text-xs font-bold mt-1 truncate">{i.title}</div></div>)}</div>{!items.some(i => String(i.collection_id) === String(c.id)) && <p className="text-xs muted mt-4">Open an artwork detail and add it to this moodboard.</p>}</div>) : <div className="empty"><BookHeart className="mx-auto mb-2"/> Create your first moodboard to save inspiration.</div>}</>; }

