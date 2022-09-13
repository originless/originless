import { NodePath } from '@babel/traverse'
import {
  ArrowFunctionExpression,
  ExportNamedDeclaration,
  Identifier,
  ImportDeclaration,
  TSEntityName,
  TSType,
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

export type Annotation =
  | AnnotationImport
  | AnnotationPrimitive
  | AnnotationNumericLiteral
  | AnnotationStringLiteral
  | AnnotationBooleanLiteral
  | AnnotationBigIntLiteral
  | AnnotationTemplateLiteral
  | AnnotationUnion

export interface FunctionParameter {
  type: 'parameter'
  name: string
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

export const getSourceForTSTypeReference = (
  path: NodePath<TSTypeReference>,
  name: string
): NodePath<ImportDeclaration> => {
  const binding = path.scope.getBinding(name.split('.')[0])

  switch (binding?.path.node.type) {
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
  return (path.get('params') as NodePath<TSType>[]).map((parameter) =>
    getAnnotationForTsType(parameter)
  )
}

const getAnnotationForTSUnionType = (path: NodePath<TSUnionType>): Annotation => {
  const types: Annotation[] = []

  for (const type of path.get('types') as NodePath<TSType>[]) {
    types.push(getAnnotationForTsType(type))
  }

  return {
    type: 'union',
    types,
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
      }
    }
  }

  throw new Error(`Unable to get annotation for ${path.node.type}`, { cause: path.node })
}

export const getFunctionParametersForFunction = (
  path: NodePath<ArrowFunctionExpression>
): FunctionParameter[] => {
  return path.get('params').map((parameter) => {
    if (parameter.node.type !== 'Identifier') {
      throw new Error(`Unable to get parameter for ${parameter.node.type}`, {
        cause: parameter.node,
      })
    }

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
