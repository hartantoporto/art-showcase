'use client';

export default function ErrorPage({ error, reset }) {
  const message =
    typeof error?.message === 'string' &&
    error.message.includes('[SPEKTRA DB CONFIG]')
      ? error.message
      : 'Could not load this section. Check PostgreSQL connection or try again.';

  return (
    <main className="container-page text-center py-28">
      <div className="eyebrow">SOMETHING WENT WRONG</div>
      <h1 className="serif text-5xl mt-4">A little creative glitch.</h1>
      <p className="muted text-sm mt-4 max-w-xl mx-auto">{message}</p>
      <button onClick={() => reset()} className="pill pill-primary mt-7">
        Try again ↻
      </button>
    </main>
  );
}
