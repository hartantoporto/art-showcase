'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, ImagePlus, Music2, FileText, Film, ArrowUpRight, Lock } from 'lucide-react';
import { COUNTRIES } from '@/lib/countries';

// FORM ARTWORK: satu form digunakan untuk membuat karya baru dan mengubah metadata karya sendiri.
export default function ArtworkForm({ categories, art }) {
    const isEdit = !!art, router = useRouter(), [file, setFile] = useState(null), [preview, setPreview] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
    function onFile(e) { const f = e.target.files?.[0]; setFile(f); if (preview)
        URL.revokeObjectURL(preview); setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : ''); }
    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        const form = new FormData(e.currentTarget);
        try {
            const url = isEdit ? `/api/artworks/${art.id}` : '/api/artworks';
            const opts = isEdit ? { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) } : { method: 'POST', body: form };
            const r = await fetch(url, opts);
            const d = await r.json();
            if (!r.ok)
                throw Error(d.error || 'Upload failed.');
            router.push(isEdit ? '/member/artworks' : `/artwork/${d.id}`);
            router.refresh();
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    return <form onSubmit={submit} className="grid gap-5"><div className="panel panel-pad"><div className="font-bold text-lg mb-5">Artwork details</div><div className="grid gap-5"><div className="field"><label htmlFor="title">Artwork title *</label><input className="input" required minLength={3} maxLength={130} name="title" id="title" defaultValue={art?.title || ''} placeholder="Give your artwork a unique title"/></div><div className="field"><label htmlFor="description">Story behind the artwork *</label><textarea className="input textarea" required minLength={5} maxLength={5000} name="description" id="description" defaultValue={art?.description || ''} placeholder="What inspired you? What should viewers feel?"/></div><div className="field-grid"><div className="field"><label htmlFor="category_id">Art category *</label><select className="input" required name="category_id" id="category_id" defaultValue={art?.category_id || ''}><option value="" disabled>Select category...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div><div className="field"><label htmlFor="country_code">Country of origin *</label><select className="input" required name="country_code" id="country_code" defaultValue={art?.country_code || ''}><option value="" disabled>Select country of origin...</option>{COUNTRIES.map(([v, n, flag]) => <option key={v} value={v}>{flag} {n}</option>)}</select></div></div><div className="field"><label htmlFor="tags">Tags * (separate with commas; at least one)</label><input className="input" required name="tags" id="tags" defaultValue={art?.tags?.join(', ') || ''} placeholder="surreal, neon, dreamy, portrait"/><p className="text-xs muted">Max. 12 tags, max. 30 characters each.</p></div></div></div>
 <div className="panel panel-pad"><h3 className="font-bold text-lg">Artwork provenance <span className="muted text-xs font-normal">(optional)</span></h3><p className="muted text-sm mt-1 mb-4">For historical, collaborative, or reference works, add the original creator and source details. Leave blank for your own original work.</p><div className="field-grid"><div className="field"><label htmlFor="original_artist">Original artist / creator</label><input className="input" name="original_artist" id="original_artist" defaultValue={art?.original_artist || ''} placeholder="e.g. Vincent van Gogh"/></div><div className="field"><label htmlFor="creation_year">Year created</label><input className="input" name="creation_year" id="creation_year" defaultValue={art?.creation_year || ''} placeholder="e.g. 1889 or c. 1503–1519"/></div><div className="field"><label htmlFor="creation_location">Place created</label><input className="input" name="creation_location" id="creation_location" defaultValue={art?.creation_location || ''} placeholder="City, country"/></div><div className="field"><label htmlFor="medium">Medium / technique</label><input className="input" name="medium" id="medium" defaultValue={art?.medium || ''} placeholder="Oil on canvas, digital painting..."/></div><div className="field"><label htmlFor="collection_name">Museum / collection</label><input className="input" name="collection_name" id="collection_name" defaultValue={art?.collection_name || ''} placeholder="Museum or collection name"/></div><div className="field"><label htmlFor="license_label">Copyright / license</label><input className="input" name="license_label" id="license_label" defaultValue={art?.license_label || ''} placeholder="Public Domain, CC BY 4.0..."/></div><div className="field col-span-full"><label htmlFor="source_url">Original source URL</label><input className="input" type="url" name="source_url" id="source_url" defaultValue={art?.source_url || ''} placeholder="https://..."/></div></div></div>
 <div className="panel panel-pad"><h3 className="font-bold text-lg">Artwork media</h3><p className="muted text-sm mt-1 mb-4">Upload images, music/audio, video, or literary PDF works. Max 15 MB.</p>{isEdit ? <div className="alert-success flex gap-2 items-center"><Lock size={15}/> Media locked after upload, as required by the assignment. Delete and recreate the artwork to change it.</div> : <><label className="block border-2 border-dashed border-[#d6e4d8] hover:border-emerald-500 transition rounded-2xl text-center p-8 cursor-pointer bg-emerald-50/50"><UploadCloud size={36} className="text-[#587b6a] mx-auto mb-3"/><div className="font-bold">{file ? file.name : 'Click to choose your creative work'}</div><div className="muted text-xs mt-2">JPG · PNG · WEBP · GIF · MP3 · WAV · OGG · MP4 · WEBM · PDF</div><input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg,video/mp4,video/webm,application/pdf" className="sr-only" required onChange={onFile}/></label>{preview && <img src={preview} alt="Upload preview" className="w-full max-w-sm max-h-[400px] object-contain rounded-2xl mt-3"/>}</>}</div>
 {error && <div role="alert" className="alert-error">{error}</div>}<button type="submit" disabled={busy} className="pill pill-primary py-4 w-fit">{busy ? 'Saving...' : isEdit ? 'Save changes' : 'Publish artwork'} <ArrowUpRight size={16}/></button></form>;
}

