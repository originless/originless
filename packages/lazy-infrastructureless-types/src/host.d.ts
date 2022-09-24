import { type Statement } from '@babel/types'

export interface CompilerHost {
  getResource: (specifier: string) => Promise<string>
  createResource: (specifier: string, content: string) => Promise<void>
  getAbsoluteSpecifier: (parentSpecifier: string, childSpecifier: string) => string
  getRelativeSpecifier: (parentSpecifier: string, childSpecifier: string) => string
}

export interface PluginHost {
  getGeneratedSpecifier: (name?: string) => `${string}.g.ts`
  getRelativeSpecifier: (parentSpecifier: string, childSpecifier: string) => string
  createResource: <T extends string>(
    specifier: T,
    contents: T extends `${string}.g.${'ts' | 'tsx' | 'js' | 'jsx' | 'mjs' | 'cjs'}`
      ? string | Statement[]
      : string
  ) => Promise<void>
}
