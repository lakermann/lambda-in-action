import {Construct} from "constructs";
import {App, S3Backend, TerraformStack} from "cdktf";

import * as aws from "@cdktf/provider-aws";
import * as random from "@cdktf/provider-random"
import MyLambdaStack from "./stacks/my-lambda-stack";
import * as path from "path";
import MyBaseInfraStack from "./stacks/my-base-infra-stack";

class MyStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        // define resources here
        const awsProvider = new aws.provider.AwsProvider(this, 'aws', {
            region: 'us-east-1'
        });

        new random.provider.RandomProvider(this, 'random', {
        });

        // S3 backend
        new S3Backend(this, {
            key: 'lambda-in-action',
            bucket: 'lambda-in-action',
            region: awsProvider.region,
        });

        const myBaseInfra = new MyBaseInfraStack(this);

        const assetPath = path.resolve(__dirname, '../test');
        new MyLambdaStack(this, 'l-test', myBaseInfra.s3Bucket, myBaseInfra.role, assetPath);

        new aws.dynamodbTable.DynamodbTable(this, 'messages-table-dynamodb', {
            name: "messages",
            billingMode: "PAY_PER_REQUEST",
            hashKey: "id",
            attribute: [{
                name: "id",
                type: "S"
            }]
        })

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
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


