import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// FOOTER: navigasi ringkas, informasi teknologi, dan batas kepemilikan karya.
export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container-page">
        <div className="footer-main">
          <div>
            <Link href="/" className="brand-lockup footer-brand">
              <span className="brand-icon">✦</span>
              <span className="brand-word">SPEKTRA<span>.</span></span>
            </Link>
            <p className="footer-description">
              A home for imagination, culture, and creative voices from every corner of the world.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Discover</strong>
              <Link href="/explore">Explore artworks</Link>
              <Link href="/challenges">Creative challenges</Link>
              <Link href="/search">Search the universe</Link>
            </div>
            <div>
              <strong>Community</strong>
              <Link href="/register">Join as a creator</Link>
              <Link href="/register?role=curator">Become a curator</Link>
              <Link href="/login">Sign in <ArrowUpRight size={13} /></Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Copyright 2026 SPEKTRA. Kode, identitas visual, dan karya orisinal dilindungi.</span>
          <span>Karya arsip tetap dikreditkan kepada pencipta dan pemegang hak masing-masing.</span>
        </div>
      </div>
    </footer>
  );
}
