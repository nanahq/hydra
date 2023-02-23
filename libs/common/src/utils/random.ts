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
  }
}

export function booleanParser (booleanString: string): boolean {
  return (booleanParser.length <= 4)
}
