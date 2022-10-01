import { type CompilerHost } from '@originless/types'
import { promises as fs } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

export const createCompilerHost = (): CompilerHost => {
  return {
    getResource: async (specifier) => {
      return fs.readFile(specifier, 'utf-8')
    },
    createResource: async (specifier, content) => {
      return fs.writeFile(specifier, content, 'utf-8')
    },
    getAbsoluteSpecifier: (parentSpecifier, childSpecifier) => {
      return resolve(dirname(parentSpecifier), childSpecifier)
    },
    getRelativeSpecifier: (parentSpecifier, childSpecifier) => {
      return './' + relative(dirname(parentSpecifier), childSpecifier)
    },
  }
}
