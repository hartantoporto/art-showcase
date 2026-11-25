'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

// HAPUS KARYA: konfirmasi sebelum menghapus karya milik Member yang sedang login.
export default function DeleteArtworkButton({ id }) { const [busy, setBusy] = useState(false); const router = useRouter(); async function remove() { if (!confirm('Delete this artwork permanently? Comments and submissions will also be deleted.'))
    return; setBusy(true); try {
    const r = await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
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
} } return <button className="btn-small btn-danger" type="button" disabled={busy} onClick={remove}><Trash2 size={13}/> Delete</button>; }

