'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const staleAction =
    error.message?.includes('Server Action') ||
    error.message?.includes('was not found on the server');

  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-muted">SOMETHING WENT WRONG</p>
        <h1 className="mt-3 font-serif text-3xl tracking-[-0.04em]">Could not load this page.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted">
          {staleAction
            ? 'The site was just updated. Hard-refresh this page (Ctrl+Shift+R / clear cache) and try again.'
            : error.message || 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => {
            if (staleAction) {
              window.location.reload();
              return;
            }
            reset();
          }}
          className="mt-6 border border-[#4f8f6e] bg-[#4f8f6e] px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-white"
        >
          {staleAction ? 'RELOAD PAGE' : 'TRY AGAIN'}
        </button>
      </div>
    </main>
  );
}
