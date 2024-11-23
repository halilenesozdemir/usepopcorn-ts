export function ErrorMessage({ error }: { error: string }) {
  return (
    <p className="error">
      <span>🥲 {error}</span>
    </p>
  );
}
