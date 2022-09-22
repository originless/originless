export interface Plugin {
  name: string
  version: string
  identifiers: {
    specifiers: string[]
    source: string
  }[]
}
