import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

export default class MyUiBucket extends Construct {

    readonly bucket

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.bucket = new aws.s3Bucket.S3Bucket(this, "bucket", {
            bucket: `lambda-in-action-ui`
        });

        new aws.s3BucketWebsiteConfiguration.S3BucketWebsiteConfiguration(this, "website-configuration", {
            bucket: this.bucket.bucket,
            indexDocument: {
                suffix: "index.html",
            }
        });

        new aws.s3BucketPolicy.S3BucketPolicy(this, "s3_policy", {
            bucket: this.bucket.id,
            policy: JSON.stringify({
                Version: "2012-10-17",
                Id: "PolicyForWebsiteEndpointsPublicContent",
                Statement: [
                    {
                        Sid: "PublicRead",
                        Effect: "Allow",
                        Principal: "*",
                        Action: ["s3:GetObject"],
                        Resource: [`${this.bucket.arn}/*`, `${this.bucket.arn}`],
                    },
                ],
            }),
        });
    }
}
