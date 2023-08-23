export function internationalisePhoneNumber (num: string): string {
  const length = num.length

  if (length === 10) { // 7011223344
    return `234${num}`
  }

  if (length === 11) { // 07011223344
    return `234${num.slice(1)}`
  }

  if (length === 14) { // +2347011223344
    return num.slice(1)
  }

  return num // 2347011223344
}
