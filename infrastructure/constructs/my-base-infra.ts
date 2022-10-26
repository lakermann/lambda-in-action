import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";
import {MyApiGateway} from "./my-api-gateway";
import * as random from "@cdktf/provider-random";
import MyLambda from "./my-lambda";
import * as path from "path";

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

        this.s3Bucket = new aws.s3Bucket.S3Bucket(this, 'code', {
            bucket: 'lambda-in-action-code',
        });

        this.lambdaRole = new aws.iamRole.IamRole(this, "role-test-lambda", {
            name: `test-lambda`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy)
        });

        const apiKey = new random.password.Password(this, 'api-key', {
            length: 16,
            special: false
        });

        const apiKeySecret = new aws.secretsmanagerSecret.SecretsmanagerSecret(this, 'api-key-secret', {
            name: 'api-key'
        });

        new aws.secretsmanagerSecretVersion.SecretsmanagerSecretVersion(this, 'api-key-secret-v1', {
            secretId: apiKeySecret.id,
            secretString: apiKey.result
        })

        const authorizerAssetSourcePath = path.resolve(__dirname, '../../application/src/authorizer');
        const authorizerFunction = new MyLambda(this, 'fun-authorizer', {
            functionName: 'authorizer',
            assetSourcePath: authorizerAssetSourcePath,
            s3Bucket: this.s3Bucket,
            role: this.lambdaRole
        });

        this.apiGateway = new MyApiGateway(this, 'authorizer-config', {
            authorizerFunction: authorizerFunction.lambdaFunction
        });
    }
}