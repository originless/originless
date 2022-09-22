import { parse } from '@babel/parser'
import { type HandlerDefinition, type Host, type Plugin } from '@lazy/infrastructureless-types'
import { getHandlerDefinitions } from './get-handler-definitions.js'
const traverse = (await import('@babel/traverse').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/traverse').default

export interface CreateCompilerOptions {
  plugins: Plugin[]
  host: Host
}

export const createCompiler = ({ plugins, host }: CreateCompilerOptions) => {
  return async (handlers: string[]) => {
    const definitions: HandlerDefinition[] = []

    for (const handler of handlers) {
      const content = await host.readFile(handler)
      const ast = parse(content, {
        sourceType: 'module',
        sourceFilename: handler,
        plugins: ['typescript', 'jsx'],
      })

      traverse(ast, {
        ExportNamedDeclaration(path) {
          definitions.push(...getHandlerDefinitions(path))
        },
      })
    }

    console.dir(definitions, { depth: null })

    for (const definition of definitions) {
      if (definition.annotation.type === 'virtual') {
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
}
