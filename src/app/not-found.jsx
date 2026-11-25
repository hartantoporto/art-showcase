import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-page text-center py-32">
      <div className="text-8xl text-[#d77f78]">✳</div>
      <div className="eyebrow mt-5">404 / LOST IN THE UNIVERSE</div>
      <h1 className="serif text-5xl mt-3">This work is out of frame.</h1>
      <p className="muted text-sm mt-4">
        Maybe it was removed, or the link never existed.
      </p>
      <Link href="/explore" className="pill pill-primary mt-7">
        Back to exploring ↗
      </Link>
    </main>
  );
}
