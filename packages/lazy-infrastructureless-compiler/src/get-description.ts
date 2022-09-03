import { Node } from '@babel/types'

export const getDescription = (node: Node): string | null => {
  console.log(node)

  return node.leadingComments?.map((comment) => comment.value.trim()).join('\r\n') || null
}
