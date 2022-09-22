import { NodePath } from '@babel/traverse'
import { Identifier, TSEntityName } from '@babel/types'

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
