import { parse } from '@babel/parser'
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

export interface Host {
  readFile: (path: string) => Promise<string>
  saveFile: (path: string, content: string) => Promise<void>
}

export interface CreateCompilerOptions {
  plugins: Plugin[]
  host: Host
}

export const createCompiler = ({ plugins, host }: CreateCompilerOptions) => {
  return async (handlers: string[]) => {
    const definitions: FunctionDefinition[] = []

    for (const handler of handlers) {
      const content = await host.readFile(handler)
      const ast = parse(content, {
        sourceType: 'module',
        sourceFilename: handler,
        plugins: ['typescript'],
      })

      traverse(ast, {
        ExportNamedDeclaration(path) {
          definitions.push(...getDefinitions(path))
        },
      })
    }

    console.dir(definitions, { depth: null })

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
}
