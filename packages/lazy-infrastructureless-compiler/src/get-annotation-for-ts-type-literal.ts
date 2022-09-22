import { type NodePath } from '@babel/traverse'
import { type Expression, type TSType, type TSTypeElement, type TSTypeLiteral } from '@babel/types'
import {
  type AnnotationObject,
  type AnnotationObjectProperty,
} from '@lazy/infrastructureless-types'
import { getAnnotationForTsType } from './get-annotation-for-ts-type.js'
import { getNameFromExpression } from './get-name-from-expression.js'

export const getAnnotationForTSTypeLiteral = (path: NodePath<TSTypeLiteral>): AnnotationObject => {
  const properties: Record<string, AnnotationObjectProperty> = {}

  for (const property of path.get('members') as NodePath<TSTypeElement>[]) {
    switch (property.node.type) {
      case 'TSPropertySignature': {
        const name = getNameFromExpression(property.get('key') as NodePath<Expression>)

        properties[name] = {
          type: 'object-property',
          name,
          required: !property.node.optional,
          annotation: getAnnotationForTsType(
            property.get('typeAnnotation.typeAnnotation') as NodePath<TSType>
          ),
        }
        break
      }

      default: {
        throw new Error(`Unable to get annotation for type ${property.node.type}`, {
          cause: property.node,
        })
      }
    }
  }

  return {
    type: 'object',
    properties,
  }
}
