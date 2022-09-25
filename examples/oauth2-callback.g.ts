import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'
import { handleCallback as handleCallbackImplementation } from './oauth2-callback.handler.ts'
export const handleCallback = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const params = {
    state: event.queryStringParameters.state,
    code: event.queryStringParameters.code,
    error: event.queryStringParameters.state,
    error_description: event.queryStringParameters.error_description,
    error_uri: event.queryStringParameters.error_uri,
  }
  const arg1 = {
    accessToken: event.cookies
      .find((cookie) => cookie.startsWith('AccessToken='))
      ?.split('=')[1],
    stateSignature: event.cookies
      .find((cookie) => cookie.startsWith('StateSignature='))
      ?.split('=')[1],
  }
  const result = await handleCallbackImplementation(params, arg1)
  return {
    statusCode: result.status,
    headers: result.headers,
    body: result.body,
  }
}
