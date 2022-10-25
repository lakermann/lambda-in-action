import {Construct} from "constructs";
import {DataAwsLambdaFunction} from "@cdktf/provider-aws/lib/data-aws-lambda-function";
import {LambdaPermission} from "@cdktf/provider-aws/lib/lambda-permission";
import {Apigatewayv2Integration} from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import {Apigatewayv2Route} from "@cdktf/provider-aws/lib/apigatewayv2-route";


export interface ApiLambdaConfig {
    apiId: string,
    apiExecutionArn: string,
    authorizerId: string,
}

export class ApiLambda extends Construct {
    constructor(scope: Construct, name: string, config: ApiLambdaConfig) {
        super(scope, name);

        const testFunction = new DataAwsLambdaFunction(this, 'fun-test', {
            functionName: 'l-test',
        });

        new LambdaPermission(this, 'api-access-l-test', {
            functionName: testFunction.functionName,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${config.apiExecutionArn}/*`,
        });

        const testIntegration = new Apigatewayv2Integration(this, 'i-test', {
            apiId: config.apiId,
            integrationType: 'AWS_PROXY',
            connectionType: 'INTERNET',
            integrationUri: testFunction.invokeArn,
        });

        new Apigatewayv2Route(this, 'test-route', {
            apiId: config.apiId,
            routeKey: 'GET /test',
            target: `integrations/${testIntegration.id}`,
            authorizerId: config.authorizerId,
            authorizationType: 'CUSTOM',
        });
    }

}