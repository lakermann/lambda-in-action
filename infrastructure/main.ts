import {Construct} from "constructs";
import {App, S3Backend, TerraformStack} from "cdktf";

import * as aws from "@cdktf/provider-aws";
import * as random from "@cdktf/provider-random"
import * as path from "path";
import {ApiLambda} from "./constructs/api-lambda";
import {ApiGateway} from "./constructs/api-gateway";
import MyLambdaConstruct from "./constructs/my-lambda-construct";
import MyDynamodbTableConstruct from "./constructs/my-dynamodb-table-construct";
import MyBaseInfraConstruct from "./constructs/my-base-infra-construct";

class MyStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        // define resources here
        const awsProvider = new aws.provider.AwsProvider(this, 'aws', {
            region: 'us-east-1'
        });

        new random.provider.RandomProvider(this, 'random', {});

        // S3 backend
        new S3Backend(this, {
            key: 'lambda-in-action',
            bucket: 'lambda-in-action',
            region: awsProvider.region,
        });

        const myBaseInfra = new MyBaseInfraConstruct(this, 'base-infra');

        const assetPath = path.resolve(__dirname, '../test');
        new MyLambdaConstruct(this, 'l-test', myBaseInfra.s3Bucket, myBaseInfra.role, assetPath);
        new MyDynamodbTableConstruct(this, "messages", "id", [{
            name: "id",
            type: "S"
        }])

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

        const apiGateway = new ApiGateway(this, 'authorizer-config');

        new ApiLambda(this, 'test', {
            apiId: apiGateway.api.id,
            apiExecutionArn: apiGateway.api.executionArn,
            authorizerId: apiGateway.authorizer.id,
        });
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


