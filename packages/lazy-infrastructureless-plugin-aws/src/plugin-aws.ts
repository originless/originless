const template = (await import('@babel/template').then(
  (module) => (module.default as any).default
)) as unknown as typeof import('@babel/template').default
import { type Expression, type Statement } from '@babel/types'
import {
  FunctionParameter,
  type Handler,
  type PluginHost,
  type Resource,
} from '@lazy/infrastructureless-types'
import { createPlugin } from '@lazy/infrastructureless-utils'
// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

const createImports = (resource: Resource, host: PluginHost): Statement => {
  return {
    type: 'ImportDeclaration',
    specifiers: resource.handlers.map((handler) => ({
      type: 'ImportSpecifier',
      imported: {
        type: 'Identifier',
        name: handler.name,
      },
      local: {
        type: 'Identifier',
        name: handler.name + 'Implementation',
      },
    })),
    source: {
      type: 'StringLiteral',
      value: host.getRelativeSpecifier(host.getGeneratedSpecifier(), resource.specifier),
    },
  }
}

const createParameter = (parameter: FunctionParameter): Expression => {
  return {
    type: 'ObjectExpression',
    properties: [],
  }
}

const createHandler = (handler: Handler, host: PluginHost): Statement => {
  const statements: Statement[] = []

  statements.push(
    ...handler.parameters.map<Statement>((parameter, index) => ({
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: parameter.name || `arg${index}`,
          },
          init: createParameter(parameter),
        },
      ],
    }))
  )

  return {
    type: 'ExportNamedDeclaration',
    specifiers: [],
    declaration: {
      type: 'VariableDeclaration',
      kind: 'const',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: handler.name,
          },
          init: {
            type: 'ArrowFunctionExpression',
            returnType: {
              type: 'TSTypeAnnotation',
              typeAnnotation: {
                type: 'TSTypeReference',
                typeName: {
                  type: 'Identifier',
                  name: 'Promise',
                },
                typeParameters: {
                  type: 'TSTypeParameterInstantiation',
                  params: [
                    {
                      type: 'TSTypeReference',
                      typeName: {
                        type: 'Identifier',
                        name: 'APIGatewayProxyStructuredResultV2',
                      },
                    },
                  ],
                },
              },
            },
            expression: true,
            async: true,
            params: [
              {
                type: 'Identifier',
                name: 'event',
                typeAnnotation: {
                  type: 'TSTypeAnnotation',
                  typeAnnotation: {
                    type: 'TSTypeReference',
                    typeName: {
                      type: 'Identifier',
                      name: 'APIGatewayProxyEventV2',
                    },
                  },
                },
              },
            ],
            body: {
              type: 'BlockStatement',
              body: [
                ...statements,
                {
                  type: 'VariableDeclaration',
                  kind: 'const',
                  declarations: [
                    {
                      type: 'VariableDeclarator',
                      id: {
                        type: 'Identifier',
                        name: 'result',
                      },
                      init: {
                        type: 'AwaitExpression',
                        argument: {
                          type: 'CallExpression',
                          callee: {
                            type: 'Identifier',
                            name: handler.name + 'Implementation',
                          },
                          arguments: handler.parameters.map((parameter, index) => ({
                            type: 'Identifier',
                            name: parameter.name || `arg${index}`,
                          })),
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'ReturnStatement',
                  argument: {
                    type: 'ObjectExpression',
                    properties: [
                      {
                        type: 'ObjectProperty',
                        key: {
                          type: 'Identifier',
                          name: 'statusCode',
                        },
                        computed: false,
                        shorthand: false,
                        value: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'result',
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            name: 'status',
                          },
                        },
                      },
                      {
                        type: 'ObjectProperty',
                        key: {
                          type: 'Identifier',
                          name: 'headers',
                        },
                        computed: false,
                        shorthand: false,
                        value: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'result',
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            name: 'headers',
                          },
                        },
                      },
                      {
                        type: 'ObjectProperty',
                        key: {
                          type: 'Identifier',
                          name: 'body',
                        },
                        computed: false,
                        shorthand: false,
                        value: {
                          type: 'MemberExpression',
                          object: {
                            type: 'Identifier',
                            name: 'result',
                          },
                          computed: false,
                          property: {
                            type: 'Identifier',
                            name: 'body',
                          },
                        },
                      },
                    ],
                  },
                },
              ],
              directives: [],
            },
          },
        },
      ],
    },
  }
}

export default createPlugin({
  name: pkg.name,
  version: pkg.version,
  accepts: ['virtual:https'],
  handler: async (resource, host) => {
    const contents: Statement[] = [
      template.statement(
        `import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'`
      )(),
      createImports(resource, host),
    ]

    for (const handler of resource.handlers) {
      contents.push(createHandler(handler, host))
    }

    await host.createResource(host.getGeneratedSpecifier(), contents)
  },
})
