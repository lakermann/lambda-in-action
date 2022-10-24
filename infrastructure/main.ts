import {Construct} from "constructs";
import {App, AssetType, S3Backend, TerraformAsset, TerraformStack} from "cdktf";

import * as aws from "@cdktf/provider-aws";
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

class MyStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        // define resources here
        const awsProvider = new aws.provider.AwsProvider(this, 'aws', {
            region: 'us-east-1'
        });

        // S3 backend
        new S3Backend(this, {
            key: 'lambda-in-action',
            bucket: 'lambda-in-action',
            region: awsProvider.region,
        });

        const s3Bucket = new aws.s3Bucket.S3Bucket(this, 'code', {
            bucket: 'lambda-in-action-code',
        });

        const asset = new TerraformAsset(this, "ta-test-lambda", {
            path: path.resolve(__dirname, '../test'),
            type: AssetType.ARCHIVE, // if left empty it infers directory and file
        });

        const s3Object = new aws.s3Object.S3Object(this, "object-test-lambda", {
            bucket: s3Bucket.bucket,
            key: `l-test/${asset.fileName}`,
            source: asset.path,
        });

        const role = new aws.iamRole.IamRole(this, "role-test-lambda", {
            name: `test-lambda`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy)
        });

        new aws.lambdaFunction.LambdaFunction(this, 'l-test', {
            functionName: 'l-test',
            role: role.arn,
            s3Bucket: s3Bucket.bucket,
            s3Key: s3Object.key,

            handler: 'index.handler',
            runtime: 'nodejs16.x'
        });

        new aws.dynamodbTable.DynamodbTable(this, 'messages-table-dynamodb', {
            name: "messages-sam",
            billingMode: "PAY_PER_REQUEST",
            hashKey: "id",
            attribute: [{
                name: "id",
                type: "S"
            }]
        })
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


