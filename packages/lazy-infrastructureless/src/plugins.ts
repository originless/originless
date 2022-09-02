import { Plugin } from '@lazy/infrastructureless-compiler'
import { object, string } from 'yup'

const pluginSchema = object({
  name: string().required(),
})

export const getPlugins = async (plugins: string[]): Promise<Plugin[]> => {
  return Promise.all(
    plugins.map(async (plugin) => {
      const module = await import(plugin, { assert: { type: 'javascript' } })

      try {
        return await pluginSchema.validate(module.default, { stripUnknown: true })
      } catch (error) {
        if (error instanceof Error) {
          // @ts-expect-error error cause is not correctly typed
          throw new Error(`Plugin "${plugin}" is invalid: ${error.message}`, { cause: error })
        } else {
          throw new Error(`Plugin "${plugin}" is invalid`)
        }
      }
    })
  )
}
