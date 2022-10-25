import {AssetType, TerraformAsset} from "cdktf";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

export interface MyLambdaConstructConfig {
    s3Bucket: aws.s3Bucket.S3Bucket,
    role: aws.iamRole.IamRole,
    assetPath: string
}

export default class MyLambdaConstruct extends Construct {
    constructor(scope: Construct, name: string, config: MyLambdaConstructConfig) {
        super(scope, name);

        const asset = new TerraformAsset(this, "ta-test-lambda", {
            path: config.assetPath,
            type: AssetType.ARCHIVE, // if left empty it infers directory and file
        });

        const s3Object = new aws.s3Object.S3Object(this, "object-test-lambda", {
            bucket: config.s3Bucket.bucket,
            key: `l-test/${asset.fileName}`,
            source: asset.path,
        });

        new aws.lambdaFunction.LambdaFunction(this, name, {
            functionName: 'l-test',
            role: config.role.arn,
            s3Bucket: config.s3Bucket.bucket,
            s3Key: s3Object.key,

            handler: 'index.handler',
            runtime: 'nodejs16.x'
        });
    }
}

