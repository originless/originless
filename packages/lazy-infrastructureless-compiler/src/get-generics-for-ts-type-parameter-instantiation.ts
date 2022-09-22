import { NodePath } from '@babel/traverse'
import { TSType, TSTypeParameterInstantiation } from '@babel/types'
import { Annotation } from '@lazy/infrastructureless-types-handler'
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
