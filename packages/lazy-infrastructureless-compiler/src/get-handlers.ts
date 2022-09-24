import { type NodePath } from '@babel/traverse'
import {
  type ArrowFunctionExpression,
  type ExportNamedDeclaration,
  type TSType,
  type VariableDeclarator,
} from '@babel/types'
import { type Handler } from '@lazy/infrastructureless-types'
import { getAnnotationForTsType } from './get-annotation-for-ts-type.js'
import { getDescription } from './get-description.js'
import { getFunctionParametersForFunction } from './get-function-parameters-for-function.js'

export const getHandlers = (path: NodePath<ExportNamedDeclaration>): Handler[] => {
  const handlers: Handler[] = []

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

        handlers.push({
          type: 'handler',
          name,
          description,
          annotation,
          parameters,
        })
      }
    }
  }

  return handlers
}
