import { Search } from 'lucide-react';
import ArtworkGrid from '@/components/ArtworkGrid';
import ChallengeCard from '@/components/ChallengeCard';
import { currentUser } from '@/lib/auth';
import { listArtworks, listChallenges } from '@/lib/data';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Global search' };
export default async function GlobalSearch({ searchParams }) {
    const sp = await searchParams;
    const q = String(sp.q || '').slice(0, 120);
    const user = await currentUser();
    const [artworks, challenges] = await Promise.all([listArtworks({ search: q, limit: 48, userId: user?.id, sort: 'popular' }), listChallenges({ search: q, limit: 30 })]);
    return <main className="container-page pt-12 pb-20"><div className="eyebrow">SEARCH / GLOBAL DISCOVERY</div><h1 className="display text-5xl sm:text-6xl mt-3">Find your next <span className="gradient-text">inspiration.</span></h1><form method="get" className="panel p-3 flex gap-2 mt-7 mb-10"><input className="input" name="q" defaultValue={q} placeholder="Artworks, creators, challenges..." aria-label="Search all content"/><button className="pill pill-primary" type="submit"><Search size={16}/> Search</button></form><div className="section-head"><div><div className="eyebrow">ARTWORKS</div><h2 className="serif section-title mt-2">Creative pieces <span className="muted text-base font-normal">({artworks.length})</span></h2></div></div><ArtworkGrid items={artworks} user={user} empty="No matching artworks found. Try a different search or explore the gallery."/><section className="pt-14"><div className="section-head"><div><div className="eyebrow">CHALLENGES</div><h2 className="serif section-title mt-2">Creative challenges <span className="muted text-base font-normal">({challenges.length})</span></h2></div></div>{challenges.length ? <div className="challenge-grid">{challenges.map(c => <ChallengeCard challenge={c} key={c.id}/>)}</div> : <div className="empty">No matching challenges yet.</div>}</section></main>;
}

