import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";
import {MyApiGateway} from "./my-api-gateway";
import MyApiSecret from "./my-api-secret";
import {MyAuthorizerFunction} from "./my-authorizer-function";
import MyUiBucket from "./my-ui-bucket";


export default class MyBaseInfra extends Construct {
    readonly s3Bucket: aws.s3Bucket.S3Bucket;
    readonly apiGateway: MyApiGateway;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.s3Bucket = new aws.s3Bucket.S3Bucket(this, `${id}-code-s3-bucket`, {
            bucket: 'lambda-in-action-code',
        });


        const myApiSecret = new MyApiSecret(this, `${id}-my-api-secret`);

        const myAuthorizerFunction = new MyAuthorizerFunction(this, `${id}-my-authorizer-function`, {
            s3Bucket: this.s3Bucket,
            apiKeyArn: myApiSecret.apiKeyArn,
        });

        const myUiBucket = new MyUiBucket(this, `${id}-code-s3-ui`)

        this.apiGateway = new MyApiGateway(this, `${id}-my-api-gateway`, {
            authorizerFunction: myAuthorizerFunction.authorizerFunction,
            allowOrigins: [`https://${myUiBucket.bucket.bucketDomainName}`, 'http://127.0.0.1:5174']
        });
    }
}
