const generate = (await import('@babel/generator').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/generator').default
import { type File, type Statement } from '@babel/types'
import { type CompilerHost, type PluginHost } from '@lazy/infrastructureless-types'

export interface CreatePluginHostOptions {
  specifier: string
  host: CompilerHost
  handleResource: (specifier: string, contents: File) => Promise<void> | void
}

export const createPluginHost = ({
  specifier: parentSpecifier,
  host,
  handleResource,
}: CreatePluginHostOptions): PluginHost => {
  return {
    createResource: async (childSpecifier, contents) => {
      const specifier = host.getSpecifier(parentSpecifier, childSpecifier)
      const source =
        typeof contents === 'object'
          ? generate(
              {
                type: 'File',
                program: {
                  type: 'Program',
                  sourceType: 'module',
                  sourceFile: specifier,
                  body: contents,
                  directives: [],
                },
              },
              {
                filename: specifier,
                retainFunctionParens: true,
                retainLines: true,
              }
            ).code
          : contents

      if (childSpecifier.endsWith('handler.g.ts')) {
        await handleResource(specifier, {
          type: 'File',
          program: {
            type: 'Program',
            sourceType: 'module',
            sourceFile: specifier,
            body: contents as unknown as Statement[],
            directives: [],
          },
        })
      }

      await host.createResource(specifier, source)
    },
  }
}
