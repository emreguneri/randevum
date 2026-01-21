// Ensures we always operate on integer kuruş.
export function toKurus(tryAmount: number): number {
  return Math.round(tryAmount * 100);
}

export function formatTry(kurus: number): string {
  return (kurus / 100).toFixed(2);
}

