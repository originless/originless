import { Node } from '@babel/types'

export const getDescription = (node: Node): string | null => {
  return node.leadingComments?.map((comment) => comment.value.trim()).join('\r\n') || null
}
