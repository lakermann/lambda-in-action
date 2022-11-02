import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";
import * as Null from "@cdktf/provider-null";
import {AssetType, Fn, TerraformAsset} from "cdktf";
import * as path from "path";

export default class MyUiApp extends Construct {

    readonly bucket

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.bucket = new aws.s3Bucket.S3Bucket(this, `${id}-ui-s3-bucket`, {
            bucket: `lambda-in-action-ui`
        });

        new aws.s3BucketWebsiteConfiguration.S3BucketWebsiteConfiguration(this, `${id}-ui-website-configuration`, {
            bucket: this.bucket.bucket,
            indexDocument: {
                suffix: "index.html",
            }
        });

        new aws.s3BucketPolicy.S3BucketPolicy(this, `${id}-ui-s3-policy`, {
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

        const assetSourcePath = path.resolve(__dirname, `../../ui/dist/`);

        const asset = new TerraformAsset(this, `${id}-ui-asset`, {
            path: assetSourcePath,
            type: AssetType.DIRECTORY,
        });

        const resource = new Null.resource.Resource(this, `${id}-ui-s3-application`, {
            triggers: { always_run: `${Fn.timestamp()}`}
        });
        resource.addOverride("provisioner", [
            {
                "local-exec": {
                    command: `aws s3 sync ${asset.path} s3://${this.bucket.bucket} --delete --acl public-read`
                },
            },
        ]);
    }
}
