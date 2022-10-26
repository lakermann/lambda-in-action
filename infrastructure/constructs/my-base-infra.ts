import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";
import {MyApiGateway} from "./my-api-gateway";
import MyLambda from "./my-lambda";
import * as path from "path";
import MyApiSecret from "./my-api-secret";

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

export default class MyBaseInfra extends Construct {
    readonly s3Bucket: aws.s3Bucket.S3Bucket;
    readonly lambdaRole: aws.iamRole.IamRole;
    readonly apiGateway: MyApiGateway;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.s3Bucket = new aws.s3Bucket.S3Bucket(this, `${id}-code-s3-bucket`, {
            bucket: 'lambda-in-action-code',
        });

        this.lambdaRole = new aws.iamRole.IamRole(this, `${id}-iam-role-lambda-execution`, {
            name: `lambda-execution-role`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy)
        });

        new MyApiSecret(this, `${id}-my-api-secret`);

        const authorizerAssetSourcePath = path.resolve(__dirname, '../../application/src/authorizer');
        const authorizerFunction = new MyLambda(this, `${id}-api-authorizer-function`, {
            functionName: 'api-authorizer-function',
            assetSourcePath: authorizerAssetSourcePath,
            s3Bucket: this.s3Bucket,
            role: this.lambdaRole
        });

        this.apiGateway = new MyApiGateway(this, `${id}-my-api-gateway`, {
            authorizerFunction: authorizerFunction.lambdaFunction
        });
    }
}