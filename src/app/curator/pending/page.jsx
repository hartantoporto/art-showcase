import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Clock3, ShieldCheck, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { deleteRejectedCuratorAction } from '@/actions/profile';
export const dynamic = 'force-dynamic';
export default async function PendingCurator() { const u = await currentUser(); if (!u)
    redirect('/login'); if (u.role !== 'curator')
    redirect('/'); if (u.curator_status === 'approved')
    redirect('/curator'); const rejected = u.curator_status === 'rejected'; return <main className="container-page min-h-[65vh] flex justify-center items-center py-20"><div className="panel panel-pad max-w-[540px] w-full text-center"><div className={'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ' + (rejected ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-700')}>{rejected ? <XCircle size={36}/> : <Clock3 size={36}/>}</div><div className="eyebrow">CURATOR APPLICATION</div><h1 className="serif text-3xl sm:text-4xl mt-3">{rejected ? 'Application not approved.' : 'Your account is under review.'}</h1><p className="muted text-sm leading-7 mt-4">{rejected ? u.rejection_reason || 'Your registration was not approved by our administrator.' : 'Thanks for applying, ' + u.name + '. An Admin will review your curator application. Your dashboard stays locked until approved.'}</p>{rejected ? <form action={deleteRejectedCuratorAction} className="mt-8"><button className="pill bg-red-100 text-red-700"><Trash2 size={16}/> Delete curator account</button><p className="muted text-xs mt-3">As required: rejected Curators can only delete their account here.</p></form> : <div className="label-badge mt-6"><ShieldCheck size={15}/> Waiting for Admin approval</div>}<div className="mt-8"><Link href="/" className="text-xs font-bold text-emerald-800"><ArrowLeft size={14} className="inline"/> Back to public gallery</Link></div></div></main>; }

