import { type Handler } from './handler-definition.js'
import { type PluginHost } from './host.js'

export interface Plugin {
  name: string
  version: string
  accepts: string[]
  handler: (definition: Handler, host: PluginHost) => Promise<void> | void
}
