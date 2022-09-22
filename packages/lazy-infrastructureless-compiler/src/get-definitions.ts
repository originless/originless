import { NodePath } from '@babel/traverse'
import {
  ArrowFunctionExpression,
  ExportNamedDeclaration,
  TSType,
  VariableDeclarator,
} from '@babel/types'
import { HandlerDefinition } from '@lazy/infrastructureless-types-handler'
import { getAnnotationForTsType } from './get-annotation-for-ts-type.js'
import { getDescription } from './get-description.js'
import { getFunctionParametersForFunction } from './get-function-parameters-for-function.js'

export const getDefinitions = (path: NodePath<ExportNamedDeclaration>): HandlerDefinition[] => {
  const definitions: HandlerDefinition[] = []

  if (path.node.declaration?.type === 'VariableDeclaration') {
    for (const variablePath of path
      .get('declaration')
      .get('declarations') as NodePath<VariableDeclarator>[]) {
      if (
        variablePath.node.id.type === 'Identifier' &&
        variablePath.node.id.typeAnnotation?.type === 'TSTypeAnnotation' &&
        variablePath.node.init?.type === 'ArrowFunctionExpression'
      ) {
        const name = variablePath.node.id.name
        const description = getDescription(path.node)
        const annotation = getAnnotationForTsType(
          variablePath.get('id.typeAnnotation.typeAnnotation') as NodePath<TSType>
        )
        const parameters = getFunctionParametersForFunction(
          variablePath.get('init') as NodePath<ArrowFunctionExpression>
        )

        if (annotation?.type !== 'virtual') continue

        definitions.push({
          type: 'handler',
          name,
          description,
          annotation,
          parameters,
        })
      }
    }
  }

  return definitions
}
