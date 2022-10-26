import {Construct} from "constructs";
import {LambdaPermission} from "@cdktf/provider-aws/lib/lambda-permission";
import {Apigatewayv2Integration} from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import {Apigatewayv2Route} from "@cdktf/provider-aws/lib/apigatewayv2-route";
import * as aws from "@cdktf/provider-aws";

export interface MyApiLambdaIntegrationConfig {
    lambdaFunction: aws.lambdaFunction.LambdaFunction,
    routeKey: string,
    apiId: string,
    apiExecutionArn: string,
    authorizerId: string,
}

export default class MyApiLambdaIntegration extends Construct {
    constructor(scope: Construct, id: string, config: MyApiLambdaIntegrationConfig) {
        super(scope, id);

        const lambdaFunction = config.lambdaFunction;

        new LambdaPermission(this, `${id}-lambda-permission`, {
            functionName: lambdaFunction.functionName,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${config.apiExecutionArn}/*`,
        });

        const apigatewayv2Integration = new Apigatewayv2Integration(this, `${id}-api-gateway-v2-integration`, {
            apiId: config.apiId,
            integrationType: 'AWS_PROXY',
            connectionType: 'INTERNET',
            integrationUri: lambdaFunction.invokeArn,
        });

        new Apigatewayv2Route(this, `${id}-api-gateway-v2-route`, {
            apiId: config.apiId,
            routeKey: config.routeKey,
            target: `integrations/${apigatewayv2Integration.id}`,
            authorizerId: config.authorizerId,
            authorizationType: 'CUSTOM',
        });
    }
}