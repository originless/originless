import path from 'node:path'
import process from 'node:process'

export const getRootDirectory = () => {
  return path.resolve(process.cwd(), '../../')
}
