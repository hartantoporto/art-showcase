import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Users } from 'lucide-react';
import { dateLabel } from '@/lib/data';

// KARTU CHALLENGE: menampilkan periode, status, hadiah, dan ringkasan challenge.
export default function ChallengeCard({ challenge: c }) { return <article className="challenge-card panel fade-in"><Link href={`/challenges/${c.id}`} className="challenge-cover"><img src={c.banner_url} alt={c.title} loading="lazy"/></Link><div className="challenge-body"><div className="flex items-center justify-between gap-3"><span className={'status status-' + c.phase}>{c.phase === 'active' ? '● Live now' : c.phase === 'upcoming' ? 'Coming soon' : 'Completed'}</span><span className="text-xs muted flex items-center gap-1"><Users size={13}/> {c.submission_count}</span></div><Link href={`/challenges/${c.id}`} className="block mt-3 font-extrabold text-lg hover:text-emerald-700">{c.title}</Link><p className="muted text-xs mt-2 line-clamp-2">{c.description}</p><div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-100 text-xs"><span className="flex gap-1 items-center muted"><CalendarDays size={13}/> {dateLabel(c.end_at)}</span><Link href={`/challenges/${c.id}`} className="font-bold text-emerald-800 flex items-center gap-1">Explore <ArrowUpRight size={14}/></Link></div></div></article>; }

