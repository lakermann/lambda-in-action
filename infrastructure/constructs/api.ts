import {Construct} from "constructs";
import {Apigatewayv2Authorizer} from "@cdktf/provider-aws/lib/apigatewayv2-authorizer";
import {Apigatewayv2Api} from "@cdktf/provider-aws/lib/apigatewayv2-api";
import {DataAwsLambdaFunction} from "@cdktf/provider-aws/lib/data-aws-lambda-function";
import {Apigatewayv2Route} from "@cdktf/provider-aws/lib/apigatewayv2-route";
import {Apigatewayv2Integration} from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import {Apigatewayv2Stage} from "@cdktf/provider-aws/lib/apigatewayv2-stage";
import {DataAwsCloudwatchLogGroup} from "@cdktf/provider-aws/lib/data-aws-cloudwatch-log-group";
import {LambdaPermission} from "@cdktf/provider-aws/lib/lambda-permission";


export class Api extends Construct {
    readonly api: Apigatewayv2Api;

    constructor(scope: Construct, name: string) {
        super(scope, name);

        this.api = new Apigatewayv2Api(this, 'lambda-in-action', {
            name: 'lambda-in-action',
            protocolType: 'HTTP',
        });

        const authorizerFunction = new DataAwsLambdaFunction(this, 'fun-authorizer', {
            functionName: 'authorizer',
        });

        const testFunction = new DataAwsLambdaFunction(this, 'fun-test', {
            functionName: 'l-test',
        });

        new LambdaPermission(this, 'api-access-l-test', {
            functionName: testFunction.functionName,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${this.api.executionArn}/*`,
        });

        const authorizer = new Apigatewayv2Authorizer(this, 'api-authorizer', {
            name: 'api-key',
            apiId: this.api.id,
            authorizerType: 'REQUEST',
            authorizerUri: authorizerFunction.invokeArn,
            identitySources: [
                '$request.header.X-Api-Key'
            ],
            enableSimpleResponses: true,
            authorizerPayloadFormatVersion: '2.0',
        });

        new LambdaPermission(this, 'invokeForApiGateway', {
            functionName: authorizerFunction.functionName,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${this.api.executionArn}/authorizers/${authorizer.id}`,
        })

        const testIntegration = new Apigatewayv2Integration(this, 'i-test', {
            apiId: this.api.id,
            integrationType: 'AWS_PROXY',
            connectionType: 'INTERNET',
            integrationUri: testFunction.invokeArn,
        });

        const accessLogGroup = new DataAwsCloudwatchLogGroup(this, 'access-log-group', {
            name: 'api-gateway-access-logging'
        });

        new Apigatewayv2Stage(this, 'stage', {
            apiId: this.api.id,
            name: '$default',
            autoDeploy: true,
            accessLogSettings: {
                destinationArn: accessLogGroup.arn,
                format: JSON.stringify({
                    authorizerError: '$context.authorizer.error',
                    integrationError: '$context.integration.error',
                    httpMethod: '$context.httpMethod',
                    ip: '$context.identity.sourceIp',
                    protocol: '$context.protocol',
                    requestId: '$context.requestId',
                    requestTime: '$context.requestTime',
                    responseLength: '$context.responseLength',
                    routeKey: '$context.routeKey',
                    status: '$context.status',
                })
            }
        })

        new Apigatewayv2Route(this, 'test-route', {
            apiId: this.api.id,
            routeKey: 'GET /test',
            target: `integrations/${testIntegration.id}`,
            authorizerId: authorizer.id,
            authorizationType: 'CUSTOM',
        });
    }
}