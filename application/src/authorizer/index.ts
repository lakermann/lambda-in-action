import {MySecretsManager} from "./secretsManager";
import {APIGatewayRequestAuthorizerEventV2} from "aws-lambda";
import {APIGatewaySimpleAuthorizerResult} from "aws-lambda/trigger/api-gateway-authorizer";

export const handler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewaySimpleAuthorizerResult> => {
    const token = event.headers?.['x-api-key'];
    console.log(JSON.stringify(event));
    console.log(`Token: ${token}`);

    // TODO: extract api-key as parameter, provide from IaC
    const secret = await MySecretsManager.getSecret('lia-api-key', 'us-east-1');

    if (secret === token) {
        console.log('Auth success');
        return {
            "isAuthorized": true,
        }
    } else {
        console.log('Auth failed');
        return {
            "isAuthorized": false,
        }
    }
}