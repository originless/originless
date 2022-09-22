import { createCompiler } from '@lazy/infrastructureless-compiler'
import glob from 'fast-glob'
import { getConfiguration, type Configuration } from './configuration.js'
import { createHost } from './create-host.js'
import { getRootDirectory } from './get-root-directory.js'
import { getPlugins } from './plugins.js'

export const build = async (overrides?: Partial<Configuration>) => {
  const configuration = await getConfiguration(overrides)

  const plugins = await getPlugins(configuration.plugins)

  const host = createHost()

  const compiler = createCompiler({ plugins, host })

  const handlers = await glob(configuration.include, {
    cwd: getRootDirectory(),
    absolute: true,
    ignore: configuration.exclude,
  })

  await compiler(handlers)
}
