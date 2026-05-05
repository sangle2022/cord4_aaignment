export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="loading-row">
      <span className="spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
