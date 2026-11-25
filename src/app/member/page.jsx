import Link from 'next/link';
import { ArrowUpRight, Heart, UploadCloud, Trophy, Image as ImageIcon, Bookmark, Sparkles } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { query } from '@/lib/db';
import { listArtworks } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import ArtworkGrid from '@/components/ArtworkGrid';
export const dynamic = 'force-dynamic';
export default async function MemberHome() {
    const u = await requireRole('member');
    const [r, arts] = await Promise.all([query(`SELECT (SELECT COUNT(*)::int FROM artworks WHERE user_id=$1 AND removed_at IS NULL) artworks,
 (SELECT COUNT(*)::int FROM likes WHERE artwork_id IN (SELECT id FROM artworks WHERE user_id=$1)) likes,
 (SELECT COUNT(*)::int FROM favorites WHERE user_id=$1) favorites,
 (SELECT COUNT(*)::int FROM submissions WHERE user_id=$1) submissions,
 COALESCE((SELECT gold_tickets::int FROM game_progress WHERE user_id=$1),0) gold_tickets,
 COALESCE((SELECT aurora_badge_earned FROM game_progress WHERE user_id=$1),FALSE) aurora_badge_earned`, [u.id]), listArtworks({ owner: u.id, sort: 'latest', limit: 4, userId: u.id })]);
    const stats = r.rows[0];
    return <DashboardShell role="member" user={u} title={`Hello, ${u.name.split(' ')[0]} ✳`} subtitle="Your creative space, your canvas, your community."><div className="metric-grid">{[['My artworks', stats.artworks, ImageIcon], ['Likes received', stats.likes, Heart], ['Favorites saved', stats.favorites, Bookmark], ['Challenge entries', stats.submissions, Trophy]].map(([n, v, I]) => <div className="metric" key={n}><I size={19} className="text-emerald-700"/><div className="metric-number mt-4">{v}</div><div className="muted text-xs mt-1">{n}</div></div>)}</div><div className="panel panel-pad mt-5 flex justify-between flex-wrap gap-4 items-center" style={{ background: 'linear-gradient(110deg,#fff6df,#f1f8ef)' }}><div><div className="eyebrow">SPEKTRA ART ADVENTURE</div><div className="font-black text-xl mt-2">{stats.aurora_badge_earned ? 'Mahkota Aurora sudah kamu raih!' : 'Lanjutkan petualangan dan kumpulkan Tiket Emas.'}</div><p className="text-xs muted mt-1">{stats.gold_tickets}/3 Tiket Emas · {stats.aurora_badge_earned ? 'Lencana tersimpan di akunmu.' : 'Tiga tiket membuka Golden Gallery berisi karya pilihan.'}</p></div><Link href="/art-games" className="pill pill-primary"><Sparkles size={16}/> {stats.aurora_badge_earned ? 'Main lagi' : 'Lanjutkan game'}</Link></div><div className="panel panel-pad mt-5 flex justify-between flex-wrap gap-4 items-center" style={{ background: 'linear-gradient(110deg,#f2e9ff,#ffe5ef)' }}><div><div className="eyebrow">CREATE & INSPIRE</div><div className="font-black text-xl mt-2">Your next masterpiece starts here.</div><p className="text-xs muted mt-1">Upload new artwork and share your story with the world.</p></div><Link href="/member/artworks/new" className="pill pill-primary"><UploadCloud size={16}/> Upload new artwork</Link></div><div className="flex justify-between items-center mt-9 mb-5"><h2 className="subhead">My latest artworks</h2><Link className="text-emerald-800 text-xs font-bold" href="/member/artworks">Manage all <ArrowUpRight size={14} className="inline"/></Link></div><ArtworkGrid items={arts} user={u} empty="Upload your first artwork to see it here."/></DashboardShell>;
}

