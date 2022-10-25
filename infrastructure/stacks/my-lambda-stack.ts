import {AssetType, TerraformAsset} from "cdktf";
import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

export default class MyLambdaStack {
    constructor(scope: Construct, name: string, s3Bucket: aws.s3Bucket.S3Bucket, role: aws.iamRole.IamRole, assetPath: string) {

        const asset = new TerraformAsset(scope, "ta-test-lambda", {
            path: assetPath,
            type: AssetType.ARCHIVE, // if left empty it infers directory and file
        });

        const s3Object = new aws.s3Object.S3Object(scope, "object-test-lambda", {
            bucket: s3Bucket.bucket,
            key: `l-test/${asset.fileName}`,
            source: asset.path,
        });

        new aws.lambdaFunction.LambdaFunction(scope, name, {
            functionName: 'l-test',
            role: role.arn,
            s3Bucket: s3Bucket.bucket,
            s3Key: s3Object.key,

            handler: 'index.handler',
            runtime: 'nodejs16.x'
        });
    }
}

