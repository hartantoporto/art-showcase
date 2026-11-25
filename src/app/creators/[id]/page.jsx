import { notFound } from 'next/navigation';
import { Globe2, Link2, Palette } from 'lucide-react';
import { query } from '@/lib/db';
import { listArtworks } from '@/lib/data';
import { currentUser } from '@/lib/auth';
import { countryFlag, countryName } from '@/lib/countries';
import ArtworkGrid from '@/components/ArtworkGrid';
import FollowButton from '@/components/FollowButton';
export const dynamic = 'force-dynamic';
export default async function Creator({ params }) {
    const { id } = await params;
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0)
        notFound();
    const user = await currentUser();
    const { rows } = await query(`SELECT u.id,u.name,u.handle,u.bio,u.avatar_url,u.website_url,u.country_code,u.created_at,
 (SELECT COUNT(*)::int FROM follows WHERE creator_id=u.id) follower_count,
 EXISTS(SELECT 1 FROM follows WHERE creator_id=u.id AND follower_id=$2) following
 FROM users u WHERE u.id=$1 AND u.role='member'`, [id, user?.id || 0]);
    if (!rows.length)
        notFound();
    const c = rows[0];
    const arts = await listArtworks({ owner: c.id, sort: 'latest', limit: 80, userId: user?.id });
    return <main className="container-page pt-10 pb-16"><div className="rounded-[28px] h-44 sm:h-60 relative overflow-hidden" style={{ background: 'radial-gradient(circle at 20% 20%,#ffbddb,transparent 40%),radial-gradient(circle at 75% 85%,#8de5ca,transparent 42%),linear-gradient(125deg,#be9bfb,#6354a9)' }}><div className="absolute text-[110px] opacity-30 right-12 -top-5 text-white">✳</div></div><div className="px-3 sm:px-9 flex flex-wrap justify-between gap-5 items-end"><div className="flex items-end gap-4"><div className="w-24 h-24 rounded-[26px] -mt-10 relative z-10 border-[5px] border-[#fcfaf7] bg-emerald-200 overflow-hidden flex items-center justify-center text-4xl font-black">{c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover"/> : c.name[0]}</div><div className="pt-5"><div className="eyebrow">CREATIVE PROFILE</div><h1 className="serif text-3xl sm:text-4xl">{c.name}</h1><p className="muted text-xs mt-1">@{c.handle}</p></div></div><FollowButton creatorId={c.id} initialCount={c.follower_count} initialFollowing={c.following} user={user}/></div><div className="px-3 sm:px-9 mt-5 max-w-2xl"><p className="text-sm leading-7">{c.bio || 'Creative mind exploring the endless possibilities of art.'}</p><div className="flex flex-wrap gap-4 mt-3 text-xs muted">{c.country_code && <span><Globe2 size={13} className="inline"/> {countryFlag(c.country_code)} {countryName(c.country_code)}</span>}{c.website_url && <a href={c.website_url} target="_blank" rel="noopener noreferrer" className="text-emerald-800"><Link2 size={13} className="inline"/> Website ↗</a>}</div></div><section className="section-pad"><div className="section-head"><div><div className="eyebrow">PORTFOLIO</div><h2 className="serif section-title mt-2">Their world in art. <span className="text-base muted font-normal">({arts.length} artworks)</span></h2></div></div><ArtworkGrid items={arts} user={user}/></section></main>;
}

