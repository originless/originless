import { createPlugin } from '@lazy/infrastructureless-utils'
// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

export default createPlugin({
  name: pkg.name,
  version: pkg.version,
  accepts: ['virtual:https'],
  handler: async (definition, host) => {
    console.dir(definition, { depth: null })
  },
})
