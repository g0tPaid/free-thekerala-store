'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-muted">SOMETHING WENT WRONG</p>
        <h1 className="mt-3 font-serif text-3xl tracking-[-0.04em]">Could not load this page.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          {error.message || 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 border border-[#4f8f6e] bg-[#4f8f6e] px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-white"
        >
          TRY AGAIN
        </button>
      </div>
    </main>
  );
}
