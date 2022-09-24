const generate = (await import('@babel/generator').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/generator').default
import { type File, type Statement } from '@babel/types'
import { type CompilerHost, type PluginHost } from '@lazy/infrastructureless-types'
import prettier from 'prettier'

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
    getGeneratedSpecifier: (name) =>
      parentSpecifier.replace(/\.handler\.ts$/, '.g.ts') as `${string}.g.ts`,
    getRelativeSpecifier: host.getRelativeSpecifier,
    createResource: async (childSpecifier, contents) => {
      const specifier = host.getAbsoluteSpecifier(parentSpecifier, childSpecifier)
      const source =
        typeof contents === 'object'
          ? prettier.format(
              generate(
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
              ).code,
              {
                printWidth: 80,
                tabWidth: 2,
                useTabs: false,
                semi: false,
                singleQuote: true,
                quoteProps: 'consistent',
                jsxSingleQuote: true,
                trailingComma: 'all',
                bracketSpacing: true,
                bracketSameLine: false,
                arrowParens: 'always',
              }
            )
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
