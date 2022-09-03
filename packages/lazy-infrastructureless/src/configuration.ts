import glob from 'fast-glob'
import { lilconfig } from 'lilconfig'
import { type MergeWithCustomizer } from 'lodash'
import _mergeWith from 'lodash.mergewith'
import _uniq from 'lodash.uniq'
import { array, InferType, object, string } from 'yup'
import { getRootDirectory } from './get-root-directory.js'

const configurationSchema = object({
  include: array(string().required()).default(['**/*.handler.ts']),
  exclude: array(string().required()).default(['node_modules/**']),
  plugins: array(string().required()).required(),
})

export type Configuration = InferType<typeof configurationSchema>

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
    configuration = await lilconfig('infrastructureless', {
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
    const filepaths = await glob(['**/infrastructureless-plugin-*/package.json'], {
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
    return await configurationSchema.validate(configuration, { stripUnknown: true })
  } catch (error) {
    if (error instanceof Error) {
      // @ts-expect-error error cause is not correctly typed
      throw new Error(`Invalid configuration: ${error.message}`, { cause: error })
    } else {
      throw new Error(`Invalid configuration`)
    }
  }
}

export const createConfiguration = (configuration: Configuration): Configuration => configuration
