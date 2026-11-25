import Link from 'next/link';
import { LayoutDashboard, Images, Bookmark, UploadCloud, UserRound, Settings, CalendarDays, Trophy, Users, ShieldCheck, FolderTree, Flag, Palette, HandHeart } from 'lucide-react';

// DASHBOARD ROLE: navigasi dan kerangka halaman Member, Curator, serta Admin.
const sets = {
    member: [['Overview', '/member', LayoutDashboard], ['My artworks', '/member/artworks', Images], ['Upload artwork', '/member/artworks/new', UploadCloud], ['Favorites', '/member/favorites', Bookmark], ['My submissions', '/member/submissions', Trophy], ['Moodboards', '/member/collections', Palette], ['Profile & account', '/member/settings', Settings]],
    curator: [['Overview', '/curator', LayoutDashboard], ['My challenges', '/curator/challenges', CalendarDays], ['Create challenge', '/curator/challenges/new', Trophy]],
    admin: [['Overview', '/admin', LayoutDashboard], ['Users', '/admin/users', Users], ['Curator approvals', '/admin/curators', ShieldCheck], ['Categories', '/admin/categories', FolderTree], ['Moderation queue', '/admin/moderation', Flag]]
};
export default function DashboardShell({ role, user, title, subtitle, children }) {
    return <div className="container-page dashboard-layout"><aside className="side-menu"><div className="panel p-4"><div className="text-xs uppercase tracking-widest muted font-extrabold">{role} workspace</div><div className="flex items-center gap-3 mt-3 mb-5"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b9d6c5] to-[#f0b9ac] flex items-center justify-center font-black">{user.name[0]}</div><div className="min-w-0"><div className="font-bold text-sm truncate">{user.name}</div><div className="text-xs muted truncate">@{user.handle}</div></div></div><nav className="side-links">{sets[role].map(([n, h, I]) => <Link href={h} key={h}><I size={16}/> {n}</Link>)}</nav></div></aside><main className="dashboard-main"><div className="mb-7"><div className="eyebrow mb-2">✳ SPEKTRA / {role.toUpperCase()}</div><h1 className="page-heading serif">{title}</h1>{subtitle && <p className="muted text-sm mt-2">{subtitle}</p>}</div>{children}</main></div>;
}

