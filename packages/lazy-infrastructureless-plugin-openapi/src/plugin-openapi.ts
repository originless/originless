// @ts-ignore
import pkg from '../package.json' assert { type: 'json' }

export default {
  name: pkg.name,
  version: pkg.version,
  identifiers: [
    {
      specifiers: ['API'],
      source: '@lazy/infrastructureless-plugin-openapi',
    },
  ],
}

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
export type URLSearchParam<T extends string> = string
export type URLPathParam<T extends string> = string
export type Cookie<T extends string> = string
export type API<M extends Method, P extends Path> = () => Promise<Response> | Response
