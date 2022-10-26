import {Construct} from "constructs";

import * as path from "path";
import * as aws from "@cdktf/provider-aws";
import MyLambda from "./my-lambda";
import MyApiLambdaIntegration from "./my-api-lambda-integration";

export interface MyLambdaAppConfig {
    name: string,
    routeKey: string,
    s3Bucket: aws.s3Bucket.S3Bucket,
    role: aws.iamRole.IamRole,
    apiId: string,
    apiExecutionArn: string,
    authorizerId: string,
}

export default class MyLambdaApp extends Construct {
    constructor(scope: Construct, id: string, config: MyLambdaAppConfig) {
        super(scope, id);

        const functionName = `app-${config.name}`;
        const assetSourcePath = path.resolve(__dirname, `../../application/dist/app/${config.name}`);

        const myLambdaFunction = new MyLambda(this, `my-lambda-function-${id}`, {
            functionName: functionName,
            assetSourcePath: assetSourcePath,
            s3Bucket: config.s3Bucket,
            role: config.role
        });

        const lambdaFunction = myLambdaFunction.lambdaFunction;

        new MyApiLambdaIntegration(this, `my-api-lambda-integration-${id}`, {
            lambdaFunction: lambdaFunction,
            routeKey: config.routeKey,
            apiId: config.apiId,
            apiExecutionArn: config.apiExecutionArn,
            authorizerId: config.authorizerId
        });
    }
}