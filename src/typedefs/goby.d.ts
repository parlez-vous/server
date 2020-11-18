declare module 'goby' {
  type Modifier = 'adj' | 'pre' | 'suf'

  interface Goby {
    generate: (modifiers: Modifier[]) => string
  }

  interface Options {
    decorator: (pieces: string[]) => string
  }

  export function init(opts?: Options): Goby
}
