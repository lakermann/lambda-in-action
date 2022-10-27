import {Construct} from "constructs";

import * as path from "path";
import * as aws from "@cdktf/provider-aws";
import MyLambda, {lambdaRolePolicy} from "./my-lambda";
import MyApiLambdaIntegration from "./my-api-lambda-integration";
import MyMessageStore from "./my-message-store";
import {MyApiGateway} from "./my-api-gateway";

export interface MyLambdaAppConfig {
    name: string,
    routeKey: string,
    s3Bucket: aws.s3Bucket.S3Bucket,
    messageStore: MyMessageStore,
    apiGateway: MyApiGateway,
}

export default class MyLambdaApp extends Construct {
    constructor(scope: Construct, id: string, config: MyLambdaAppConfig) {
        super(scope, id);

        const functionName = `app-${config.name}`;
        const assetSourcePath = path.resolve(__dirname, `../../application/dist/app/${config.name}`);

        const lambdaRole = new aws.iamRole.IamRole(this, `${id}-iam-role-lambda-execution`, {
            name: `lambda-execution-role-${functionName}`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
            inlinePolicy: [config.messageStore.myDynamoDbTable.inlinePolicy]
        });

        const myLambdaFunction = new MyLambda(this, `${id}-my-lambda-function`, {
            functionName: functionName,
            assetSourcePath: assetSourcePath,
            s3Bucket: config.s3Bucket,
            role: lambdaRole
        });

        const lambdaFunction = myLambdaFunction.lambdaFunction;

        new MyApiLambdaIntegration(this, `${id}-my-api-lambda-integration`, {
            lambdaFunction: lambdaFunction,
            routeKey: config.routeKey,
            apiId: config.apiGateway.api.id,
            apiExecutionArn: config.apiGateway.api.executionArn,
            authorizerId: config.apiGateway.authorizer.id
        });
    }
}
