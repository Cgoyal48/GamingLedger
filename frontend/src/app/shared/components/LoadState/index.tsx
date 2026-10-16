export function LoadState({ error, retry }: { error?: boolean; retry?: () => void }) {
  if (error) {
    return (
      <div className="panel flex items-center justify-between gap-4 p-5" role="alert">
        <p className="text-sm text-destructive">Could not load this. Check that the API is running.</p>
        {retry ? (
          <button type="button" onClick={retry} className="hud-label text-foreground underline underline-offset-4">
            Retry
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <p className="hud-label animate-pulse py-10 text-center" role="status">
      Loading save data…
    </p>
  );
}
