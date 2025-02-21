export function subtractFivePercent (amount: number): number {
  const fivePercent = amount * 0.05
  const result = amount - fivePercent
  return Math.ceil(result / 10) * 10
};
