export function internationalisePhoneNumber (num: string): string {
  switch (num.length) {
    case 10:
      // 7011223344
      return `+234${num}`
    case 11:
      // 07011223344
      return `+234${num.slice(1)}`
    case 13:
      // +2347011223344
      return `+${num}`
    default:
      return num
  }
}
