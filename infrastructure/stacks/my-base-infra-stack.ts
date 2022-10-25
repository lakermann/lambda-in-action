import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";

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


export default class MyBaseInfraStack {
    s3Bucket: aws.s3Bucket.S3Bucket;
    role: aws.iamRole.IamRole;

    constructor(scope: Construct) {
        this.s3Bucket = new aws.s3Bucket.S3Bucket(scope, 'code', {
            bucket: 'lambda-in-action-code',
        });

        this.role = new aws.iamRole.IamRole(scope, "role-test-lambda", {
            name: `test-lambda`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy)
        });
    }
}