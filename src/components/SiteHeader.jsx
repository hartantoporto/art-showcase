'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowUpRight, LogOut, Search, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

// HEADER RESPONSIF: navigasi desktop/mobile, pencarian, dashboard, login, dan logout.
export default function SiteHeader({ user }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const dashboard = user ? (user.role === 'member' ? '/member' : user.role === 'admin' ? '/admin' : user.curator_status === 'approved' ? '/curator' : '/curator/pending') : null;
    async function logout() {
        await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'logout' }) });
        router.push('/');
        router.refresh();
        setOpen(false);
    }
    const links = [['Explore', '/explore'], ['Challenges', '/challenges'], ['Art Games 🎟️', '/art-games'], ['For creators', '/register']];
    return (<header className="site-header">
      <div className="container-page header-inner">
        <Link href="/" className="brand-lockup" aria-label="SPEKTRA Home"><span className="brand-icon">✦</span><span className="brand-word">SPEKTRA<span>.</span></span></Link>
        <nav className="nav-links" aria-label="Main navigation">{links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</nav>
        <div className="nav-actions">
          <Link className="header-search" href="/search" aria-label="Search artworks and challenges"><Search size={17}/></Link>
          {user ? <><Link className="header-user" href={dashboard}><span className="header-user-avatar">{user.name?.[0] || 'S'}</span><span>{user.name.split(' ')[0]}</span><ArrowUpRight size={14}/></Link><button className="header-icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={16}/></button></> : <><Link className="header-signin" href="/login">Sign in</Link><Link className="pill pill-primary header-join" href="/register">Join the universe <Sparkles size={14}/></Link></>}
          <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
        </div>
      </div>
      {open && <nav className="nav-mobile" aria-label="Mobile navigation">{links.map(([label, href]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}<Link href="/search" onClick={() => setOpen(false)}>Search the gallery</Link>{dashboard && <Link href={dashboard} onClick={() => setOpen(false)}>My dashboard</Link>}{!user && <><Link href="/login" onClick={() => setOpen(false)}>Sign in</Link><Link href="/register" onClick={() => setOpen(false)}>Join the universe</Link></>}</nav>}
    </header>);
}

