import { NodePath } from '@babel/traverse'
import {
  ArrowFunctionExpression,
  ExportNamedDeclaration,
  Expression,
  Identifier,
  ImportDeclaration,
  Program,
  TSEntityName,
  TSType,
  TSTypeElement,
  TSTypeLiteral,
  TSTypeParameterInstantiation,
  TSTypeReference,
  TSUnionType,
  VariableDeclarator,
} from '@babel/types'
import { getDescription } from './get-description.js'

export interface AnnotationImport {
  type: 'reference'
  name: string
  source: string
  generics: Annotation[]
}
export interface AnnotationPrimitive {
  type: 'primitive'
  primitive: 'string' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'symbol' | 'null'
}
export interface AnnotationNumericLiteral {
  type: 'number'
  value: number
}
export interface AnnotationStringLiteral {
  type: 'string'
  value: string
}
export interface AnnotationBooleanLiteral {
  type: 'boolean'
  value: boolean
}
export interface AnnotationBigIntLiteral {
  type: 'bigint'
  value: bigint
}
export interface AnnotationTemplateLiteral {
  type: 'template'
  value: unknown
}
export interface AnnotationUnion {
  type: 'union'
  types: Annotation[]
}

export interface AnnotationObject {
  type: 'object'
  properties: Record<string, Annotation>
}

export type Annotation =
  | AnnotationImport
  | AnnotationPrimitive
  | AnnotationNumericLiteral
  | AnnotationStringLiteral
  | AnnotationBooleanLiteral
  | AnnotationBigIntLiteral
  | AnnotationTemplateLiteral
  | AnnotationUnion
  | AnnotationObject

export interface FunctionParameter {
  type: 'parameter'
  name: string | null
  description: string | null
  annotation: Annotation | null
}

export interface FunctionDefinition {
  type: 'function'
  name: string
  description: string | null
  annotation: Annotation
  parameters: FunctionParameter[]
}

export const getNameFromTSEntityName = (path: NodePath<TSEntityName>): string => {
  switch (path.node.type) {
    case 'Identifier':
      return path.node.name
    case 'TSQualifiedName':
      return `${getNameFromTSEntityName(
        path.get('left') as NodePath<TSEntityName>
      )}.${getNameFromTSEntityName(path.get('right') as NodePath<Identifier>)}`
  }
}

export const getNameFromExpression = (path: NodePath<Expression>): string => {
  switch (path.node.type) {
    case 'Identifier': {
      return path.node.name
    }

    default: {
      throw new Error(`Unable to get name from expression ${path.node.type}`, { cause: path.node })
    }
  }
}

export const getSourceForTSTypeReference = (
  path: NodePath<TSTypeReference>,
  name: string
): NodePath<ImportDeclaration | TSType> => {
  const binding = path.scope.getBinding(name.split('.')[0])

  if (!binding) {
    let parent: NodePath | null = path.parentPath

    while (parent) {
      switch (parent.node.type) {
        case 'Program': {
          for (const path of (parent as NodePath<Program>).get('body')) {
            switch (path.node.type) {
              case 'TSTypeAliasDeclaration': {
                if (path.node.id.name === name) {
                  return path.get('typeAnnotation') as NodePath<TSType>
                }
                break
              }
            }
          }
          break
        }
      }

      parent = parent.parentPath
    }

    throw new Error(`Could not find binding for ${name}`)
  }

  switch (binding.path.node.type) {
    case 'ImportSpecifier': {
      return binding.path.parentPath as NodePath<ImportDeclaration>
    }

    default: {
      throw new Error(`Unable to find source for ${name}`, { cause: path.node })
    }
  }
}

export const getGenericsForTSTypeParameterInstantiation = (
  path: NodePath<TSTypeParameterInstantiation>
): Annotation[] => {
  if (!path.node) {
    return []
  }

  return (path.get('params') as NodePath<TSType>[]).map((parameter) =>
    getAnnotationForTsType(parameter)
  )
}

const getAnnotationForTSUnionType = (path: NodePath<TSUnionType>): AnnotationUnion => {
  const types: Annotation[] = []

  for (const type of path.get('types') as NodePath<TSType>[]) {
    types.push(getAnnotationForTsType(type))
  }

  return {
    type: 'union',
    types,
  }
}

const getAnnotationForTSTypeLiteral = (path: NodePath<TSTypeLiteral>): AnnotationObject => {
  const properties: Record<string, Annotation> = {}

  // TSCallSignatureDeclaration | TSConstructSignatureDeclaration | TSPropertySignature | TSMethodSignature | TSIndexSignature;

  for (const property of path.get('members') as NodePath<TSTypeElement>[]) {
    switch (property.node.type) {
      case 'TSPropertySignature': {
        const name = getNameFromExpression(property.get('key') as NodePath<Expression>)

        properties[name] = getAnnotationForTsType(
          property.get('typeAnnotation.typeAnnotation') as NodePath<TSType>
        )
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
            type: 'reference',
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

export const getFunctionParametersForFunction = (
  path: NodePath<ArrowFunctionExpression>
): FunctionParameter[] => {
  return path.get('params').map((parameter) => {
    switch (parameter.node.type) {
      case 'Identifier': {
        const name = parameter.node.name
        const description = getDescription(parameter.node)
        const annotation = getAnnotationForTsType(
          parameter.get('typeAnnotation.typeAnnotation') as NodePath<TSType>
        )

        return {
          type: 'parameter',
          name,
          description,
          annotation,
        }
      }
      case 'AssignmentPattern': {
        const description = getDescription(parameter.node)
        const annotation = getAnnotationForTsType(
          parameter.get('left.typeAnnotation.typeAnnotation') as NodePath<TSType>
        )

        return {
          type: 'parameter',
          name: null,
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

export const getDefinitions = (path: NodePath<ExportNamedDeclaration>): FunctionDefinition[] => {
  const definitions: FunctionDefinition[] = []

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

        if (!annotation) continue

        definitions.push({
          type: 'function',
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
