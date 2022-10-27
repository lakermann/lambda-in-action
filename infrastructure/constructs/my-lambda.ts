import {AssetType, Fn, TerraformAsset} from "cdktf";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

export const lambdaRolePolicy = {
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

export interface MyLambdaConfig {
    functionName: string,
    assetSourcePath: string,
    s3Bucket: aws.s3Bucket.S3Bucket,
    role: aws.iamRole.IamRole,
}

export default class MyLambda extends Construct {
    readonly lambdaFunction: aws.lambdaFunction.LambdaFunction;

    constructor(scope: Construct, id: string, config: MyLambdaConfig) {
        super(scope, id);

        const functionName = config.functionName;

        const asset = new TerraformAsset(this, `${id}-terraform-asset`, {
            path: config.assetSourcePath,
            type: AssetType.ARCHIVE,
        });

        const s3Object = new aws.s3Object.S3Object(this, `${id}-s3-object`, {
            bucket: config.s3Bucket.bucket,
            key: `${functionName}/${asset.fileName}`,
            source: asset.path,
        });

        this.lambdaFunction = new aws.lambdaFunction.LambdaFunction(this, `${id}-lambda-function`, {
            functionName: functionName,
            role: config.role.arn,
            s3Bucket: config.s3Bucket.bucket,
            s3Key: s3Object.key,

            sourceCodeHash: Fn.filebase64sha256(asset.path),
            handler: 'index.handler',
            runtime: 'nodejs16.x'
        });
    }
}

