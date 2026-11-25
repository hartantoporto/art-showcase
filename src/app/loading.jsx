export default function Loading() {
  return (
    <main className="container-page py-12">
      <div className="skeleton w-72 h-12 rounded-2xl mb-8" />
      <div className="art-grid">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <div className="skeleton aspect-[4/4.5] rounded-2xl" />
            <div className="skeleton w-3/4 h-4 rounded mt-3" />
            <div className="skeleton w-1/2 h-3 rounded mt-2" />
          </div>
        ))}
      </div>
    </main>
  );
}
