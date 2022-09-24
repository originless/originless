import generate from '@babel/generator'
import { type ParseResult } from '@babel/parser'
import { type File } from '@babel/types'
import { type CompilerHost, type PluginHost } from '@lazy/infrastructureless-types'

export interface CreatePluginHostOptions {
  specifier: string
  host: CompilerHost
  handleResource: (specifier: string, contents: ParseResult<File>) => Promise<void> | void
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
          ? generate(contents, {
              filename: specifier,
              retainFunctionParens: true,
              retainLines: true,
            }).code
          : contents

      if (childSpecifier.endsWith('handler.g.ts')) {
        await handleResource(specifier, contents as unknown as ParseResult<File>)
      }

      await host.createResource(specifier, source)
    },
  }
}
