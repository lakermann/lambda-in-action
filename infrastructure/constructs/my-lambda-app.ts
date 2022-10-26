import {Construct} from "constructs";

import * as path from "path";
import * as aws from "@cdktf/provider-aws";
import MyLambda from "./my-lambda";
import MyApiLambdaIntegration from "./my-api-lambda-integration";
import {IamRoleInlinePolicy} from "@cdktf/provider-aws/lib/iam-role";

export interface MyLambdaAppConfig {
    name: string,
    routeKey: string,
    s3Bucket: aws.s3Bucket.S3Bucket,
    rolePolicy: string,
    inlinePolicy: IamRoleInlinePolicy[],
    apiId: string,
    apiExecutionArn: string,
    authorizerId: string,
}

export default class MyLambdaApp extends Construct {
    constructor(scope: Construct, id: string, config: MyLambdaAppConfig) {
        super(scope, id);

        const functionName = `app-${config.name}`;
        const assetSourcePath = path.resolve(__dirname, `../../application/dist/app/${config.name}`);

        const lambdaRole = new aws.iamRole.IamRole(this, `${id}-iam-role-lambda-execution`, {
            name: `lambda-execution-role-${functionName}`,
            assumeRolePolicy: config.rolePolicy,
            inlinePolicy: config.inlinePolicy
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
            apiId: config.apiId,
            apiExecutionArn: config.apiExecutionArn,
            authorizerId: config.authorizerId
        });
    }
}
