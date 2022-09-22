import { Host } from '@lazy/infrastructureless-compiler'
import { promises as fs } from 'fs'

export const createHost = (): Host => {
  return {
    readFile: async (path) => {
      return fs.readFile(path, 'utf-8')
    },
    saveFile: async (path, content) => {
      return fs.writeFile(path, content, 'utf-8')
    },
  }
}
