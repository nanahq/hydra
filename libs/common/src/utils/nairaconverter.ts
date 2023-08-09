export const KOBO_VAR = 100
export function nairaToKobo (naira: string): number {
    return Number(naira) * KOBO_VAR
}
