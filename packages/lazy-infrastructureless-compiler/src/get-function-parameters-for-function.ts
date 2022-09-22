import { type NodePath } from '@babel/traverse'
import { type ArrowFunctionExpression, type TSType } from '@babel/types'
import { type FunctionParameter } from '@lazy/infrastructureless-types'
import { getAnnotationForTsType } from './get-annotation-for-ts-type.js'
import { getDescription } from './get-description.js'

export const getFunctionParametersForFunction = (
  path: NodePath<ArrowFunctionExpression>
): FunctionParameter[] => {
  return path.get('params').map((parameter) => {
    switch (parameter.node.type) {
      case 'Identifier': {
        const name = parameter.node.name
        const required = !parameter.node.optional
        const description = getDescription(parameter.node)
        const annotation = getAnnotationForTsType(
          parameter.get('typeAnnotation.typeAnnotation') as NodePath<TSType>
        )

        return {
          type: 'parameter',
          name,
          required,
          description,
          annotation,
        }
      }
      case 'AssignmentPattern': {
        const required = false
        const description = getDescription(parameter.node)
        const annotation = getAnnotationForTsType(
          parameter.get('left.typeAnnotation.typeAnnotation') as NodePath<TSType>
        )

        return {
          type: 'parameter',
          name: null,
          required,
          description,
          annotation,
        }
      }

      default: {
        throw new Error(`Unable to get parameter for ${parameter.node.type}`, {
          cause: parameter.node,
        })
      }
    }
  })
}
