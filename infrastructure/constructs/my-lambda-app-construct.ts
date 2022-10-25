import {Construct} from "constructs";
import {AssetType, Fn, TerraformAsset} from "cdktf";

import * as path from "path";
import * as aws from "@cdktf/provider-aws";
import {LambdaPermission} from "@cdktf/provider-aws/lib/lambda-permission";
import {Apigatewayv2Integration} from "@cdktf/provider-aws/lib/apigatewayv2-integration";
import {Apigatewayv2Route} from "@cdktf/provider-aws/lib/apigatewayv2-route";

export interface MyLambdaAppConstructConfig {
    name: string,
    routeKey: string,
    s3Bucket: aws.s3Bucket.S3Bucket,
    role: aws.iamRole.IamRole,
    apiId: string,
    apiExecutionArn: string,
    authorizerId: string,
}

export default class MyLambdaAppConstruct extends Construct {
    constructor(scope: Construct, id: string, config: MyLambdaAppConstructConfig) {
        super(scope, id); // TODO: take id from config.name?

        const functionName = `app-${config.name}`;

        // TODO: extract into lambda construct?
        const assetSourcePath = path.resolve(__dirname, `../../application/dist/app/${config.name}`);
        const asset = new TerraformAsset(this, `terraform-asset-${functionName}`, {
            path: assetSourcePath,
            type: AssetType.ARCHIVE,
        });

        const s3Object = new aws.s3Object.S3Object(this, `s3-object-${functionName}`, {
            bucket: config.s3Bucket.bucket,
            key: `${config.name}/${asset.fileName}`,
            source: asset.path,
        });

        const lambdaFunction = new aws.lambdaFunction.LambdaFunction(this, `lambda-function-${functionName}`, {
            functionName: functionName,
            role: config.role.arn,
            s3Bucket: config.s3Bucket.bucket,
            s3Key: s3Object.key,

            sourceCodeHash: Fn.filebase64sha256(asset.path),
            handler: 'index.handler',
            runtime: 'nodejs16.x'
        });

        // TODO: extract into api-lambda construct?
        new LambdaPermission(this, `lambda-permission-${functionName}`, {
            functionName: lambdaFunction.functionName,
            action: 'lambda:InvokeFunction',
            principal: 'apigateway.amazonaws.com',
            sourceArn: `${config.apiExecutionArn}/*`,
        });

        const apigatewayv2Integration = new Apigatewayv2Integration(this, `apigateway-v2-integration-${functionName}`, {
            apiId: config.apiId,
            integrationType: 'AWS_PROXY',
            connectionType: 'INTERNET',
            integrationUri: lambdaFunction.invokeArn,
        });

        new Apigatewayv2Route(this, `apigateway-v2-route-${functionName}`, {
            apiId: config.apiId,
            routeKey: config.routeKey,
            target: `integrations/${apigatewayv2Integration.id}`,
            authorizerId: config.authorizerId,
            authorizationType: 'CUSTOM',
        });
    }
}