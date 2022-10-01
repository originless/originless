import glob from 'fast-glob'
import { lilconfig } from 'lilconfig'
import { type MergeWithCustomizer } from 'lodash'
import _mergeWith from 'lodash.mergewith'
import _uniq from 'lodash.uniq'
import { z } from 'zod'
import { getRootDirectory } from './get-root-directory.js'

const configurationSchema = z.object({
  include: z.array(z.string()).default(['**/*.handler.ts']),
  exclude: z.array(z.string()).default(['node_modules/**']),
  plugins: z.array(z.string()),
})

export type Configuration = z.infer<typeof configurationSchema>

export const mergeConfiguration = (
  ...configurations: Partial<Configuration>[]
): Partial<Configuration> => {
  const configuration = _mergeWith({}, ...configurations, ((a, b) =>
    Array.isArray(a) ? [...a, ...b] : undefined) as MergeWithCustomizer)

  return configuration
}

export const getConfiguration = async (
  overrides?: Partial<Configuration>
): Promise<Configuration> => {
  let configuration: Partial<Configuration> = {}

  try {
    configuration = await lilconfig('originless', {
      loaders: {
        '.js': (filepath: string) => import(filepath),
        '.mjs': (filepath: string) => import(filepath),
      },
    })
      .search()
      .then((result) => result?.config?.default || result?.config || {})
  } catch {}

  if (overrides) {
    configuration = mergeConfiguration(configuration, overrides)
  }

  if (!configuration.plugins) {
    const filepaths = await glob(['**/originless-plugin-*/package.json'], {
      cwd: getRootDirectory(),
      absolute: true,
    })

    configuration.plugins = await Promise.all(
      filepaths.map((filepath) =>
        import('file://' + filepath, { assert: { type: 'json' } }).then((pkg) => pkg.default.name)
      )
    )
  }

  configuration.plugins = _uniq(configuration.plugins)

  try {
    return configurationSchema.parse(configuration)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid configuration: ${error.message}`, { cause: error })
    } else {
      throw new Error(`Invalid configuration`)
    }
  }
}

export const createConfiguration = (configuration: Configuration): Configuration => configuration
