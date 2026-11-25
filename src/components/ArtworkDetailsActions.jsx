'use client';
import { useState } from 'react';
import { Heart, Bookmark, Flag, Send, Trash2, AlertCircle, Plus, FolderHeart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// AKSI DETAIL KARYA: Like, Favorites, komentar, laporan, dan pengelolaan interaksi Member.
export default function ArtworkDetailsActions({ art, user, comments, collections = [] }) {
    const router = useRouter(), [liked, setLiked] = useState(art.liked), [fav, setFav] = useState(art.favorited), [likes, setLikes] = useState(art.like_count), [text, setText] = useState(''), [message, setMessage] = useState(''), [showReport, setShowReport] = useState(false), [reason, setReason] = useState('Plagiarism'), [detail, setDetail] = useState(''), [busy, setBusy] = useState(false), [reported, setReported] = useState(false), [selectedCollection, setSelectedCollection] = useState('');
    const member = user?.role === 'member';
    async function act(payload) { setBusy(true); setMessage(''); try {
        const res = await fetch('/api/interactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json().catch(() => ({ error: 'Respons server tidak valid.' }));
        if (!res.ok)
            throw Error(data.error || 'Something went wrong.');
        if (payload.op === 'like') {
            setLiked(data.active);
            setLikes(data.likes);
            setMessage(data.active ? 'Kamu menyukai karya ini.' : 'Like dibatalkan.');
        }
        if (payload.op === 'favorite') {
            setFav(data.active);
            setMessage(data.active ? 'Tersimpan di Favorites!' : 'Dihapus dari Favorites.');
            router.refresh();
        }
        ;
        if (payload.op === 'comment') {
            setText('');
            router.refresh();
        }
        if (payload.op === 'deleteComment')
            router.refresh();
        if (payload.op === 'reportArtwork') {
            setReported(true);
            setShowReport(false);
        }
        if (payload.op === 'reportComment')
            setMessage('Comment reported. Thank you.');
    }
    catch (e) {
        setMessage(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function addCollection() { if (!selectedCollection)
        return; setBusy(true); try {
        const r = await fetch('/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'add', collection_id: selectedCollection, artwork_id: art.id }) });
        const d = await r.json().catch(() => ({ error: 'Respons server tidak valid.' }));
        if (!r.ok)
            throw Error(d.error);
        setMessage('Added to moodboard!');
    }
    catch (e) {
        setMessage(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <div className="mt-6"><div className="flex flex-wrap gap-2">
 {member ? <>
 <button disabled={busy} type="button" aria-pressed={Boolean(liked)} onClick={() => act({ op: 'like', artwork_id: art.id })} className={'pill ' + (liked ? 'bg-rose-100 text-rose-700' : 'pill-secondary')}><Heart size={17} fill={liked ? 'currentColor' : 'none'}/> {likes} Likes</button>
 <button disabled={busy} type="button" aria-pressed={Boolean(fav)} onClick={() => act({ op: 'favorite', artwork_id: art.id })} className={'pill ' + (fav ? 'bg-emerald-100 text-emerald-800' : 'pill-secondary')}><Bookmark size={16} fill={fav ? 'currentColor' : 'none'}/> {fav ? 'Saved' : 'Save'}</button>
 {String(user.id) !== String(art.user_id) && <button type="button" onClick={() => setShowReport(!showReport)} className="pill pill-secondary"><Flag size={15}/> Report</button>}</> : !user ?
            <Link href={`/login?next=${encodeURIComponent(`/artwork/${art.id}`)}`} className="pill pill-primary"><Heart size={16}/> Login to Like, Save & Comment</Link> :
            <span className="pill pill-secondary" role="note">Interactions are available to Members only</span>}
 </div>
 {!member && <p className="text-xs muted mt-3">{user ? 'Curators and Admins can browse, but only Members can interact.' : 'Sign in as a Member to like, save, comment, or report artwork.'}</p>}
 {member && collections.length > 0 && (fav ? <div className="mt-4 flex gap-2"><select className="input" aria-label="Select moodboard" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}><option value="">Add to a moodboard...</option>{collections.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select><button className="pill pill-secondary" onClick={addCollection} disabled={!selectedCollection || busy}><Plus size={15}/> Add</button></div> : <p className="text-xs muted mt-4">Save this artwork as Favorite to add it to a moodboard.</p>)}
 {showReport && <div className="panel panel-pad mt-4"><div className="font-bold text-sm">Report artwork</div><div className="field mt-3"><label>Reason</label><select className="input" value={reason} onChange={e => setReason(e.target.value)}><option>Plagiarism</option><option>Offensive or discriminatory content</option><option>Inappropriate content</option><option>Copyright violation</option><option>Other</option></select></div><textarea className="input textarea mt-3" value={detail} maxLength={500} onChange={e => setDetail(e.target.value)} placeholder="Additional context (optional)"/><button disabled={busy || reported} className="pill pill-primary mt-3" onClick={() => act({ op: 'reportArtwork', artwork_id: art.id, reason, detail })}>{reported ? 'Reported' : 'Submit report'}</button></div>}
 {message && <div role="status" className="interaction-feedback mt-3">{message}</div>}
 <div className="mt-11"><h3 className="subhead mb-3">Conversation <span className="muted font-normal text-sm">({comments.length})</span></h3>{member ? <form onSubmit={e => { e.preventDefault(); act({ op: 'comment', artwork_id: art.id, body: text }); }} className="flex gap-2 mb-4"><input className="input" value={text} maxLength={1200} minLength={1} required placeholder="Share something thoughtful..." onChange={e => setText(e.target.value)}/><button disabled={busy || !text.trim()} type="submit" className="pill pill-primary" aria-label="Post comment"><Send size={16}/></button></form> : <p className="text-sm muted mb-3">Comments are public. <a href="/login" className="text-[#587b6a] font-bold">Log in as Member</a> to join.</p>}
 <div className="comments-box">{comments.length ? comments.map(c => <div className="comment" key={c.id}><div className="flex justify-between gap-2"><div className="font-bold text-xs">@{c.handle}</div><div className="flex gap-2">{String(user?.id) === String(c.user_id) && <button className="text-xs text-red-500" onClick={() => { if (confirm('Delete your comment?'))
        act({ op: 'deleteComment', comment_id: c.id }); }} title="Delete comment"><Trash2 size={14}/></button>}{member && String(user.id) !== String(c.user_id) && <button className="text-xs muted" onClick={() => { const reason = prompt('Report reason (e.g., offensive / spam):'); if (reason?.trim())
        act({ op: 'reportComment', comment_id: c.id, reason }); }} title="Report comment"><Flag size={14}/></button>}</div></div><p className="text-sm mt-2 leading-6">{c.body}</p><span className="text-xs muted mt-2 block">{new Date(c.created_at).toLocaleDateString()}</span></div>) : <div className="text-sm muted py-5">No comments yet. Be the first to share some love.</div>}</div></div></div>;
}

