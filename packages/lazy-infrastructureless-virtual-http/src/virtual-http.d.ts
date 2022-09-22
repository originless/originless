declare module 'virtual:http' {
  export type Method =
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH'

  export type Path = `/${string}`

  export type Header<T extends string> = string
  export type Headers = Record<string, string>

  export type SearchParam<T extends string> = string
  export type SearchParams = Record<string, string>

  export type PathParam<T extends string> = string
  export type PathParams = Record<string, string>

  export type Cookie<T extends string> = string
  export type Cookies = Record<string, string>

  export interface Response {
    status?: number
    headers?: Headers
    body?: string
  }

  export type Endpoint<M extends Method, P extends Path> = (
    ...parameters: any[]
  ) => Promise<Response> | Response
}
