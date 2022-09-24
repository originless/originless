import { type Statement } from '@babel/types'

export interface CompilerHost {
  getResource: (specifier: string) => Promise<string>
  createResource: (specifier: string, content: string) => Promise<void>
  getSpecifier: (parentSpecifier: string, childSpecifier: string) => string
}

export interface PluginHost {
  createResource: <T extends string>(
    specifier: T,
    contents: T extends `${string}.g.${'ts' | 'tsx' | 'js' | 'jsx' | 'mjs' | 'cjs'}`
      ? string | Statement[]
      : string
  ) => Promise<void>
}
