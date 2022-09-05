import { File } from '@babel/types'
import { getDefinitions } from './get-definitions.js'
const traverse = (await import('@babel/traverse').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/traverse').default

export interface Plugin {
  name: string
  version: string
  identifiers: {
    specifiers: string[]
    source: string
  }[]
}

export const compile = async (
  ast: File,
  plugins: Plugin[] = [
    {
      name: '@lazy/infrastructureless-plugin-discord-interactions',
      version: '0.0.0',
      identifiers: [
        {
          specifiers: ['SlashCommand', 'UserCommand', 'MessageCommand'],
          source: '@lazy/infrastructureless-plugin-discord-interactions',
        },
      ],
    },
  ]
) => {
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const definitions = getDefinitions(path)

      console.dir(definitions, { depth: null })
    },
  })
}
