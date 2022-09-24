import { parse } from '@babel/parser'
import { type File } from '@babel/types'
import {
  type CompilerHost,
  type Plugin,
  type PluginHost,
  type Resource,
} from '@lazy/infrastructureless-types'
import { createPluginHost } from './create-plugin-host.js'
import { getHandlers } from './get-handlers.js'
const traverse = (await import('@babel/traverse').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/traverse').default

export interface CreateCompilerOptions {
  plugins: Plugin[]
  host: CompilerHost
}

export const createCompiler = ({ plugins, host }: CreateCompilerOptions) => {
  const parseResource = (specifier: string, contents: File): Resource[] => {
    const resources: Resource[] = []

    traverse(contents, {
      ExportNamedDeclaration(path) {
        const handlers = getHandlers(path)

        if (handlers.length) {
          resources.push({
            type: 'resource',
            specifier,
            handlers,
          })
        }
      },
    })

    return resources
  }

  const getResources = async (specifiers: string[]): Promise<Resource[]> => {
    const resources: Resource[] = []

    for (const specifier of specifiers) {
      const content = await host.getResource(specifier)
      const ast = parse(content, {
        sourceType: 'module',
        sourceFilename: specifier,
        plugins: ['typescript', 'jsx'],
      })

      resources.push(...parseResource(specifier, ast))
    }

    return resources
  }

  const callPlugins = async (resource: Resource, host: PluginHost): Promise<void> => {
    for (const plugin of plugins) {
      const handlers = resource.handlers.filter((handler) =>
        plugin.accepts.includes(handler.annotation.source)
      )

      if (handlers.length) {
        await plugin.handler(
          {
            type: 'resource',
            specifier: resource.specifier,
            handlers,
          },
          host
        )
      }
    }
  }

  const handleResources = async (resources: Resource[]): Promise<void> => {
    for (const resource of resources) {
      const pluginHost = createPluginHost({
        specifier: resource.specifier,
        host,
        handleResource: async (specifier, contents) => {
          const resources = parseResource(specifier, contents)
          await handleResources(resources)
        },
      })

      await callPlugins(resource, pluginHost)
    }
  }

  return async (handlers: string[]) => {
    const resources = await getResources(handlers)
    await handleResources(resources)
  }
}
