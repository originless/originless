import { type NodePath } from '@babel/traverse'
import { type TSType, type TSTypeParameterInstantiation } from '@babel/types'
import { type Annotation } from '@lazy/infrastructureless-types'
import { getAnnotationForTsType } from './get-annotation-for-ts-type.js'

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
