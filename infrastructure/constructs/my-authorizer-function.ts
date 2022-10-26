import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";
import * as path from "path";
import MyLambda from "./my-lambda";

const lambdaRolePolicy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
};

const authorizerPolicyTemplate = (apiKeyArn: string) => ({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": [
                apiKeyArn
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
});

export interface MyAuthorizerFunctionConfig {
    s3Bucket: aws.s3Bucket.S3Bucket,
    apiKeyArn: string,
}

export class MyAuthorizerFunction extends Construct {
    readonly authorizerFunction: aws.lambdaFunction.LambdaFunction

    constructor(scope: Construct, id: string, config: MyAuthorizerFunctionConfig) {
        super(scope, id);

        const authorizerPolicy = {
            name: 'authorizer-policy',
            policy: JSON.stringify(authorizerPolicyTemplate(config.apiKeyArn))
        }
        const authorizerRole = new aws.iamRole.IamRole(this, `${id}-iam-role-authorizer`, {
            name: 'authorizer-role',
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
            inlinePolicy: [authorizerPolicy]
        });

        const authorizerAssetSourcePath = path.resolve(__dirname, '../../application/src/authorizer');
        const myAuthorizerLambda = new MyLambda(this, `${id}-api-authorizer-function`, {
            functionName: 'api-authorizer-function',
            assetSourcePath: authorizerAssetSourcePath,
            s3Bucket: config.s3Bucket,
            role: authorizerRole
        });

        this.authorizerFunction = myAuthorizerLambda.lambdaFunction;
    }
}