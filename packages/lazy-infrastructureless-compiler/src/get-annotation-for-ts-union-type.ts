import { NodePath } from '@babel/traverse'
import { TSType, TSUnionType } from '@babel/types'
import { Annotation, AnnotationUnion } from '@lazy/infrastructureless-types-handler'
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
