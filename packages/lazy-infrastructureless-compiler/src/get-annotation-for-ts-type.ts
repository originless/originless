import { type NodePath } from '@babel/traverse'
import {
  type TSEntityName,
  type TSType,
  type TSTypeLiteral,
  type TSTypeParameterInstantiation,
  type TSTypeReference,
  type TSUnionType,
} from '@babel/types'
import { type Annotation } from '@lazy/infrastructureless-types'
import { getAnnotationForTSTypeLiteral } from './get-annotation-for-ts-type-literal.js'
import { getAnnotationForTSUnionType } from './get-annotation-for-ts-union-type.js'
import { getGenericsForTSTypeParameterInstantiation } from './get-generics-for-ts-type-parameter-instantiation.js'
import { getNameFromTSEntityName } from './get-name-from-ts-entity-name.js'
import { getSourceForTSTypeReference } from './get-source-for-ts-type-reference.js'

export const getAnnotationForTsType = (path: NodePath<TSType>): Annotation => {
  switch (path.node.type) {
    case 'TSBooleanKeyword': {
      return {
        type: 'primitive',
        primitive: 'boolean',
      }
    }

    case 'TSUnionType': {
      return getAnnotationForTSUnionType(path as NodePath<TSUnionType>)
    }

    case 'TSLiteralType': {
      switch (path.node.literal.type) {
        case 'StringLiteral': {
          return {
            type: 'string',
            value: path.node.literal.value,
          }
        }
        case 'NumericLiteral': {
          return {
            type: 'number',
            value: path.node.literal.value,
          }
        }
        case 'BigIntLiteral': {
          return {
            type: 'bigint',
            value: BigInt(path.node.literal.value),
          }
        }
        case 'BooleanLiteral': {
          return {
            type: 'boolean',
            value: path.node.literal.value,
          }
        }
      }
    }

    case 'TSTypeLiteral': {
      return getAnnotationForTSTypeLiteral(path as NodePath<TSTypeLiteral>)
    }

    case 'TSTypeReference': {
      const name = getNameFromTSEntityName(path.get('typeName') as NodePath<TSEntityName>)
      const source = getSourceForTSTypeReference(path as NodePath<TSTypeReference>, name)
      const parameters = getGenericsForTSTypeParameterInstantiation(
        path.get('typeParameters') as NodePath<TSTypeParameterInstantiation>
      )

      switch (source.node.type) {
        case 'ImportDeclaration': {
          return {
            type: 'virtual',
            name,
            source: source.node.source.value,
            generics: parameters,
          }
        }
        case 'TSUnionType': {
          return getAnnotationForTSUnionType(source as NodePath<TSUnionType>)
        }
        case 'TSTypeLiteral': {
          return getAnnotationForTSTypeLiteral(source as NodePath<TSTypeLiteral>)
        }
      }
    }
  }

  throw new Error(`Unable to get annotation for ${path.node.type}`, { cause: path.node })
}
