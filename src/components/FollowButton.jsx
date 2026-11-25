'use client';
import { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';

// FOLLOW KREATOR: Member dapat mengikuti dan berhenti mengikuti kreator.
export default function FollowButton({ creatorId, initialCount, initialFollowing, user }) {
    const [following, setFollowing] = useState(initialFollowing), [count, setCount] = useState(initialCount), [busy, setBusy] = useState(false);
    if (!user || user.role !== 'member' || String(user.id) === String(creatorId))
        return <span className="tag">{count} followers</span>;
    async function toggle() { setBusy(true); try {
        const r = await fetch('/api/interactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'follow', creator_id: creatorId }) });
        const d = await r.json();
        if (!r.ok)
            throw Error(d.error);
        setFollowing(d.active);
        setCount(d.count);
    }
    catch (e) {
        alert(e.message);
    }
    finally {
        setBusy(false);
    } }
    return <button disabled={busy} className="pill pill-primary" onClick={toggle}>{following ? <UserCheck size={16}/> : <UserPlus size={16}/>} {following ? 'Following' : 'Follow'} · {count}</button>;
}

