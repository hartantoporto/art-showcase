import Link from 'next/link';
import { Trophy } from 'lucide-react';
import ChallengeCard from '@/components/ChallengeCard';
import { listChallenges } from '@/lib/data';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Creative challenges' };
export default async function Challenges({ searchParams }) { const s = await searchParams; const list = await listChallenges({ search: s.q || '', active: s.active === '1' }); return <main className="container-page pt-12 pb-20"><div className="eyebrow">THE CREATIVE PLAYGROUND</div><h1 className="display text-5xl sm:text-7xl mt-3">Make something <span className="gradient-text">extraordinary.</span></h1><p className="muted mt-4 text-sm max-w-xl leading-7">Creative challenges from organizations and communities around the globe. Join, make, and let your work shine.</p><form className="flex flex-wrap gap-3 mt-9 mb-9" method="get"><input className="input max-w-lg" name="q" defaultValue={s.q || ''} placeholder="Search challenges..."/><select className="input max-w-[200px]" name="active" defaultValue={s.active || ''}><option value="">All phases</option><option value="1">Live challenges</option></select><button className="pill pill-primary">Search ↗</button></form>{list.length ? <div className="challenge-grid">{list.map(c => <ChallengeCard key={c.id} challenge={c}/>)}</div> : <div className="empty"><Trophy className="mx-auto"/> No challenges found.</div>}</main>; }

