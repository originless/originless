import { NodePath } from '@babel/traverse'
import { Expression, TSType, TSTypeElement, TSTypeLiteral } from '@babel/types'
import { AnnotationObject, AnnotationObjectProperty } from '@lazy/infrastructureless-types-handler'
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
