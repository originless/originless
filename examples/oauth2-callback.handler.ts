import { API, Cookie, URLSearchParam } from '@lazy/infrastructureless-plugin-openapi'

type HandleCallbackParams =
  | {
      state: URLSearchParam<'state'>
      code: URLSearchParam<'code'>
    }
  | {
      state: URLSearchParam<'state'>
      error: URLSearchParam<'state'>
      error_description: URLSearchParam<'error_description'>
      error_uri: URLSearchParam<'error_uri'>
    }

type HandleCallbackCookies = {
  userId?: Cookie<'User'>
  stateSignature?: Cookie<'StateSignature'>
}

export const handleCallback: API<'POST', '/callback'> = (
  params: HandleCallbackParams,
  { userId, stateSignature }: HandleCallbackCookies = {}
) => {}
