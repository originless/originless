import { type CompilerHost } from '@lazy/infrastructureless-types'
import { promises as fs } from 'node:fs'
import { dirname, resolve } from 'node:path'

export const createCompilerHost = (): CompilerHost => {
  return {
    getResource: async (specifier) => {
      return fs.readFile(specifier, 'utf-8')
    },
    createResource: async (specifier, content) => {
      return fs.writeFile(specifier, content, 'utf-8')
    },
    getSpecifier: (parentSpecifier, childSpecifier) => {
      return resolve(dirname(parentSpecifier), childSpecifier)
    },
  }
}
