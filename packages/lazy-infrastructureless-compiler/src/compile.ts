import { File } from '@babel/types'
import { FunctionDefinition, getDefinitions } from './get-definitions.js'
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

export const compile = async (ast: File, plugins: Plugin[]) => {
  const definitions: FunctionDefinition[] = []

  traverse(ast, {
    ExportNamedDeclaration(path) {
      definitions.push(...getDefinitions(path))
    },
  })

  for (const definition of definitions) {
    if (definition.annotation.type === 'reference') {
      for (const plugin of plugins) {
        for (const identifier of plugin.identifiers) {
          if (
            definition.annotation.source === identifier.source &&
            identifier.specifiers.includes(definition.annotation.name)
          ) {
            console.log(plugin)
          }
        }
      }
    }
  }
}
