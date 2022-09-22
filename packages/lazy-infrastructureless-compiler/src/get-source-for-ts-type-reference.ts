import { NodePath } from '@babel/traverse'
import { ImportDeclaration, Program, TSType, TSTypeReference } from '@babel/types'

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
