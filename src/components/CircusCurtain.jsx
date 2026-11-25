'use client';

import { useCallback, useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

// FITUR TIRAI PEMBUKA: tampil setiap kali homepage dibuka, lalu menyingkap panggung.
export default function CircusCurtain() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  // TOMBOL LEWATI: pengunjung dapat langsung masuk ke galeri tanpa menunggu animasi.
  const finish = useCallback(() => {
    setOpen(true);
    setVisible(false);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Timer menjaga perubahan state terjadi setelah effect, bukan saat render berlangsung.
    const showTimer = window.setTimeout(() => {
      setVisible(true);
      if (reducedMotion) setOpen(true);
    }, 0);

    if (reducedMotion) {
      const closeTimer = window.setTimeout(finish, 2600);
      return () => {
        window.clearTimeout(showTimer);
        window.clearTimeout(closeTimer);
      };
    }

    const openTimer = window.setTimeout(() => setOpen(true), 650);
    const closeTimer = window.setTimeout(finish, 3100);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
    };
  }, [finish]);

  if (!visible) return null;

  return (
    <div
      className={`circus-intro${open ? ' circus-intro-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Selamat datang di SPEKTRA"
    >
      <div className="circus-intro-bg" />
      <img className="circus-intro-left" src="/images/circus/curtain-left.svg" alt="" />
      <img className="circus-intro-right" src="/images/circus/curtain-right.svg" alt="" />
      <div className="circus-intro-center">
        <Sparkles size={25} />
        <span>WELCOME TO</span>
        <h2>THE GRAND<br />ART CIRCUS</h2>
        <p>Every masterpiece has a story.</p>
      </div>
      <button
        type="button"
        className="circus-intro-skip"
        onClick={finish}
        aria-label="Lewati animasi pembuka"
      >
        Skip intro <X size={15} />
      </button>
    </div>
  );
}
