import { parse } from '@babel/parser'
import { compile } from '@lazy/infrastructureless-compiler'
import glob from 'fast-glob'
import { promises as fs } from 'fs'
import { getConfiguration, type Configuration } from './configuration.js'
import { getRootDirectory } from './get-root-directory.js'
import { getPlugins } from './plugins.js'

export const build = async (overrides?: Partial<Configuration>) => {
  const configuration = await getConfiguration(overrides)

  const plugins = await getPlugins(configuration.plugins)

  const handlers = await glob(configuration.include, {
    cwd: getRootDirectory(),
    absolute: true,
    ignore: configuration.exclude,
  })

  for (const handler of handlers) {
    const source = await fs.readFile(handler, 'utf8')
    const sourceAST = parse(source, {
      sourceType: 'module',
      sourceFilename: handler,
      plugins: ['typescript'],
    })

    await compile(sourceAST, plugins)
  }
}
