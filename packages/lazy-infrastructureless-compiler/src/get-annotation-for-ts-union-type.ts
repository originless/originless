import { type NodePath } from '@babel/traverse'
import { type TSType, type TSUnionType } from '@babel/types'
import { type Annotation, type AnnotationUnion } from '@lazy/infrastructureless-types'
import { getAnnotationForTsType } from './get-annotation-for-ts-type.js'

export const getAnnotationForTSUnionType = (path: NodePath<TSUnionType>): AnnotationUnion => {
  const types: Annotation[] = []

  for (const type of path.get('types') as NodePath<TSType>[]) {
    types.push(getAnnotationForTsType(type))
  }

  return {
    type: 'union',
    types,
  }
}
