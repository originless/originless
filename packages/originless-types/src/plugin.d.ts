import { type Resource } from './handler-definition.js'
import { type PluginHost } from './host.js'

export interface Plugin {
  name: string
  version: string
  accepts: string[]
  handler: (resource: Resource, host: PluginHost) => Promise<void> | void
}
