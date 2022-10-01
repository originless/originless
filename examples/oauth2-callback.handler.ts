import { type Cookie, type Endpoint, type SearchParam } from 'virtual:https'

type HandleCallbackParams =
  | {
      state: SearchParam<'state'>
      code: SearchParam<'code'>
    }
  | {
      state: SearchParam<'state'>
      error: SearchParam<'state'>
      errorDescription: SearchParam<'error_description'>
      errorURI: SearchParam<'error_uri'>
    }

type HandleCallbackCookies = {
  accessToken?: Cookie<'AccessToken'>
  stateSignature?: Cookie<'StateSignature'>
}

const verifyAccessToken = async (accessToken?: string) => {
  return Boolean(accessToken)
}

const verifyStateSignature = async (state: string, stateSignature?: string): Promise<boolean> => {
  return true
}

const exchangeAuthorizationCode = async (code: string) => {}

export const handleCallback: Endpoint<'POST', '/callback'> = async (
  params: HandleCallbackParams,
  { accessToken, stateSignature }: HandleCallbackCookies = {}
) => {
  const accessTokenIsValid = await verifyAccessToken(accessToken)
  if (!accessTokenIsValid) {
    return {
      status: 302,
      headers: {
        Location: '/login',
      },
    }
  }

  const stateSignatureIsValid = await verifyStateSignature(params.state, stateSignature)
  if (!stateSignatureIsValid) {
    return {
      status: 400,
    }
  }

  if ('code' in params && params.code) {
    await exchangeAuthorizationCode(params.code)

    return {
      status: 302,
      headers: {
        Location: '/',
      },
    }
  } else {
    return {
      status: 400,
    }
  }
}
