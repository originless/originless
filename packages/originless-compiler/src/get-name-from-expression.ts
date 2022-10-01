import { type NodePath } from '@babel/traverse'
import { type Expression } from '@babel/types'

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
