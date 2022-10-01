import { type Plugin } from '@originless/types'
import { z } from 'zod'

const pluginSchema = z.object({
  name: z.string(),
  version: z.string(),
  accepts: z.array(z.string()).min(1),
  handler: z.function().args(z.any(), z.any()).returns(z.any()),
})

export const getPlugins = async (plugins: string[]): Promise<Plugin[]> => {
  return Promise.all(
    plugins.map(async (plugin) => {
      const module = await import(plugin)

      try {
        return pluginSchema.parse(module.default)
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
