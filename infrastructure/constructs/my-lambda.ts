import {AssetType, Fn, TerraformAsset} from "cdktf";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

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

        const asset = new TerraformAsset(this, `terraform-asset-${functionName}`, {
            path: config.assetSourcePath,
            type: AssetType.ARCHIVE,
        });

        const s3Object = new aws.s3Object.S3Object(this, `s3-object-${functionName}`, {
            bucket: config.s3Bucket.bucket,
            key: `${functionName}/${asset.fileName}`,
            source: asset.path,
        });

        this.lambdaFunction = new aws.lambdaFunction.LambdaFunction(this, `lambda-function-${functionName}`, {
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

