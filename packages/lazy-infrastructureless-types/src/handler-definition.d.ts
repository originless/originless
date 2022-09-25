export interface AnnotationVirtual {
  type: 'virtual'
  name: string
  source: string
  generics: Annotation[]
}

export interface AnnotationPrimitive {
  type: 'primitive'
  primitive: 'string' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'symbol' | 'null'
}

export interface AnnotationNumericLiteral {
  type: 'number'
  value: number
}

export interface AnnotationStringLiteral {
  type: 'string'
  value: string
}

export interface AnnotationBooleanLiteral {
  type: 'boolean'
  value: boolean
}

export interface AnnotationBigIntLiteral {
  type: 'bigint'
  value: bigint
}

export interface AnnotationTemplateLiteral {
  type: 'template'
  value: unknown
}

export interface AnnotationUnion<T extends Annotation[] = Annotation[]> {
  type: 'union'
  types: T
}

export interface AnnotationObjectProperty {
  type: 'object-property'
  name: string
  required: boolean
  annotation: Annotation
}

export interface AnnotationObject {
  type: 'object'
  properties: Record<string, AnnotationObjectProperty>
}

export type Annotation =
  | AnnotationVirtual
  | AnnotationPrimitive
  | AnnotationNumericLiteral
  | AnnotationStringLiteral
  | AnnotationBooleanLiteral
  | AnnotationBigIntLiteral
  | AnnotationTemplateLiteral
  | AnnotationUnion
  | AnnotationObject

export interface FunctionParameter {
  type: 'parameter'
  name: string | null
  required: boolean
  description: string | null
  annotation: Annotation | null
}

export interface Handler {
  type: 'handler'
  name: string
  description: string | null
  annotation: AnnotationVirtual
  parameters: FunctionParameter[]
}

export interface Resource {
  type: 'resource'
  specifier: string
  handlers: Handler[]
}
