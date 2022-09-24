import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'
import { handleCallback as handleCallbackImplementation } from './oauth2-callback.handler.ts'
export const handleCallback = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const params = {}
  const arg1 = {}
  const result = await handleCallbackImplementation(params, arg1)
  return {
    statusCode: result.status,
    headers: result.headers,
    body: result.body,
  }
}
