import {Construct} from "constructs";
import {Apigatewayv2Authorizer} from "@cdktf/provider-aws/lib/apigatewayv2-authorizer";
import {Apigatewayv2Api} from "@cdktf/provider-aws/lib/apigatewayv2-api";
import {Apigatewayv2Stage} from "@cdktf/provider-aws/lib/apigatewayv2-stage";
import {DataAwsCloudwatchLogGroup} from "@cdktf/provider-aws/lib/data-aws-cloudwatch-log-group";
import {LambdaPermission} from "@cdktf/provider-aws/lib/lambda-permission";
import * as aws from "@cdktf/provider-aws";

export interface MyApiGatewayConfig {
    authorizerFunction: aws.lambdaFunction.LambdaFunction
}

export class MyApiGateway extends Construct {
    readonly api: Apigatewayv2Api;
    readonly authorizer: Apigatewayv2Authorizer;

    constructor(scope: Construct, id: string, config: MyApiGatewayConfig) {
        super(scope, id);

        this.api = new Apigatewayv2Api(this, `api-gateway-v2-api-${id}`, {
            name: 'lambda-in-action',
            protocolType: 'HTTP',
        });

        this.authorizer = new Apigatewayv2Authorizer(this, `api-gateway-v2-authorizer-${id}`, {
            name: 'api-key',
            apiId: this.api.id,
            authorizerType: 'REQUEST',
            authorizerUri: config.authorizerFunction.invokeArn,
            identitySources: [
                '$request.header.X-Api-Key'
            ],
            enableSimpleResponses: true,
            authorizerPayloadFormatVersion: '2.0',
        });

        new LambdaPermission(this, `api-gateway-authorizer-lambda-permission-${id}`, {
            functionName: config.authorizerFunction.functionName,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${this.api.executionArn}/authorizers/${this.authorizer.id}`,
        })

        const accessLogGroup = new DataAwsCloudwatchLogGroup(this, 'access-log-group', {
            name: 'api-gateway-access-logging'
        });

        new Apigatewayv2Stage(this, `api-gateway-v2-stage-${id}`, {
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
        });
    }
}