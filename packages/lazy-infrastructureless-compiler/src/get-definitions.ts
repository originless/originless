import { NodePath } from '@babel/traverse'
import { ExportNamedDeclaration, TSTypeAnnotation, VariableDeclarator } from '@babel/types'
import { getDescription } from './get-description.js'

export interface AnnotationExternal {
  type: 'external'
  name: string
  source: string
  generics: Annotation[]
}

export interface AnnotationPrimitive {
  type: 'primitive'
  primitive: 'string' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'symbol' | 'null'
}

export type Annotation = AnnotationExternal | AnnotationPrimitive

export interface FunctionParameter {
  type: 'parameter'
  name: string
  description: string | null
  annotation: Annotation | null
}

export interface Function {
  type: 'function'
  name: string
  description: string | null
  annotation: Annotation
  parameters: FunctionParameter[]
}

export const getAnnotation = (path: NodePath<TSTypeAnnotation>): Annotation => {
  if (
    path.node.typeAnnotation.type === 'TSTypeReference' &&
    path.node.typeAnnotation.typeName.type === 'Identifier'
  ) {
    const specifier = path.node.typeAnnotation.typeName.name
    const parameters = path.node.typeAnnotation.typeParameters?.params.map((parameter) => parameter)

    return {
      type: 'external',
      name: specifier,
      // @ts-ignore
      source: path.scope.getBinding(specifier)?.path.parentPath?.node.source.value,
      generics: [],
    }
  }

  throw new Error(`Unable to parse "${path.node.type}"`, { cause: path.node })
}

export const getDefinitions = (path: NodePath<ExportNamedDeclaration>): Function[] => {
  const definitions: Function[] = []

  if (path.node.declaration?.type === 'VariableDeclaration') {
    for (const variablePath of path
      .get('declaration')
      .get('declarations') as NodePath<VariableDeclarator>[]) {
      if (
        variablePath.node.id.type === 'Identifier' &&
        variablePath.node.id.typeAnnotation?.type === 'TSTypeAnnotation'
      ) {
        const name = variablePath.node.id.name
        const description = getDescription(path.node)
        const annotation = getAnnotation(
          variablePath.get('id').get('typeAnnotation') as NodePath<TSTypeAnnotation>
        )

        definitions.push({
          type: 'function',
          name,
          description,
          annotation,
          parameters: [],
        })
      }
    }
  }

  return definitions
}
