const template = (await import('@babel/template').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/template').default
import { type Statement } from '@babel/types'
import { createPlugin } from '@lazy/infrastructureless-utils'
// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

export default createPlugin({
  name: pkg.name,
  version: pkg.version,
  accepts: ['virtual:https'],
  handler: async (resource, host) => {
    const contents: Statement[] = [
      template.statement(
        `import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'`
      )(),
    ]

    await host.createResource('./oauth2-callback.g.ts', contents)
  },
})
