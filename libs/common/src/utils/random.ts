export const RandomGen = {
  genRandomNum: (rounds: number = 9, length: number = 7): number => {
    const gen: number[] = []
    for (let i = 0; i < length; i++) {
      gen.push(Math.floor(Math.random() * rounds))
    }
    const rando = gen.join('')
    return Number(rando)
  },
  genRandomString: (rounds: number = 100, length: number = 7): string => {
    const gen: number[] = []
    for (let i = 0; i < length; i++) {
      gen.push(Math.floor(Math.random() * rounds))
    }
    return gen.join('')
  },

  generateAlphanumericString: (length: number): string => {
    if (length <= 6) {
      throw new Error('Length should be greater than 6.')
    }

    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'

    const alphaPart = alphabet.slice(0, 2)

    const alphanumericPart = alphabet + numbers

    const result =
      alphaPart +
      Array.from(
        { length: length - 2 },
        () =>
          alphanumericPart[Math.floor(Math.random() * alphanumericPart.length)]
      ).join('')

    return result.toUpperCase()
  }
}

export function booleanParser (booleanString: string): boolean {
  return booleanString.length === 4
}
