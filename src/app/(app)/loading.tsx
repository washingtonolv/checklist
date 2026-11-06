export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
      <span className="sr-only">Carregando o conteúdo...</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="space-y-3">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-64 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="card space-y-4 p-5">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-8 w-16" />
              <div className="skeleton h-3 w-32 max-w-full" />
            </div>
          ))}
        </div>
        <div className="card space-y-5 p-5">
          <div className="skeleton h-5 w-40" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
