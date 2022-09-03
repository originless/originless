import { Plugin } from '@lazy/infrastructureless-compiler'
import { array, object, string } from 'yup'

const pluginSchema = object({
  name: string().required(),
  version: string().required(),
  identifier: object({
    specifiers: array(string().required()).required(),
    source: string().required(),
  }).required(),
})

export const getPlugins = async (plugins: string[]): Promise<Plugin[]> => {
  return Promise.all(
    plugins.map(async (plugin) => {
      const module = await import(plugin, { assert: { type: 'javascript' } })

      try {
        return await pluginSchema.validate(module.default, { stripUnknown: true })
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Plugin "${plugin}" is invalid: ${error.message}`, { cause: error })
        } else {
          throw new Error(`Plugin "${plugin}" is invalid`)
        }
      }
    })
  )
}
