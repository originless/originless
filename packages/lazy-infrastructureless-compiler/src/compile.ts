import { File } from '@babel/types'

export interface Plugin {
  name: string
}

export const compile = async (ast: File, plugins: Plugin[]) => {}
