export function driverFeeCalculator (initialFee: number, percentage: number): number {
  const deductedFee = initialFee - (initialFee / 100 * percentage)
  return Math.round(deductedFee / 10) * 10
};
