import Link from 'next/link';
import { Plus, Pencil, ExternalLink } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { listArtworks, dateLabel } from '@/lib/data';
import DashboardShell from '@/components/DashboardShell';
import DeleteArtworkButton from '@/components/DeleteArtworkButton';
export const dynamic = 'force-dynamic';
export default async function MyArtworks() { const u = await requireRole('member'); const arts = await listArtworks({ owner: u.id, limit: 100, sort: 'latest', userId: u.id }); return <DashboardShell role="member" user={u} title="My artworks" subtitle="Everything you've shared with the creative universe."><div className="flex justify-end mb-5"><Link href="/member/artworks/new" className="pill pill-primary"><Plus size={16}/> Upload artwork</Link></div><div className="panel panel-pad table-wrap"><table className="data-table"><thead><tr><th>Artwork</th><th>Category</th><th>Likes</th><th>Published</th><th>Actions</th></tr></thead><tbody>{arts.map(a => <tr key={a.id}><td><Link className="font-bold hover:text-emerald-700" href={`/artwork/${a.id}`}>{a.title}</Link><div className="text-xs muted mt-1">{a.media_type} · {a.country_code}</div></td><td>{a.category_name}</td><td>{a.like_count}</td><td>{dateLabel(a.created_at)}</td><td><div className="flex gap-2"><Link href={`/member/artworks/${a.id}/edit`} className="btn-small"><Pencil size={13}/> Edit</Link><DeleteArtworkButton id={a.id}/></div></td></tr>)}</tbody></table>{!arts.length && <div className="empty mt-4">No artworks yet. Upload your first creative piece.</div>}</div></DashboardShell>; }

