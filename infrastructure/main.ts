import {Construct} from "constructs";
import {App, S3Backend, TerraformStack} from "cdktf";

import * as aws from "@cdktf/provider-aws";
import * as random from "@cdktf/provider-random"
import {MyApiGateway} from "./constructs/my-api-gateway";
import MyDynamodbTable from "./constructs/my-dynamodb-table";
import MyBaseInfra from "./constructs/my-base-infra";
import {DataAwsLambdaFunction} from "@cdktf/provider-aws/lib/data-aws-lambda-function";
import MyLambdaApp from "./constructs/my-lambda-app";

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

        const myBaseInfra = new MyBaseInfra(this, 'base-infra');

        new MyDynamodbTable(this, "messages", "id", [{
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

        const authorizerFunction = new DataAwsLambdaFunction(this, 'fun-authorizer', {
            functionName: 'authorizer',
        });

        const apiGateway = new MyApiGateway(this, 'authorizer-config', {
            authorizerFunction: authorizerFunction
        });

        const apiTestAppName = 'api-test';
        new MyLambdaApp(this, `my-lambda-app-construct-${apiTestAppName}`, {
            name: apiTestAppName,
            routeKey: 'GET /test',
            s3Bucket: myBaseInfra.s3Bucket,
            role: myBaseInfra.lambdaRole,
            apiId: apiGateway.api.id,
            apiExecutionArn: apiGateway.api.executionArn,
            authorizerId: apiGateway.authorizer.id,
        });

        const recordViewingsAppName = 'record-viewings';
        new MyLambdaApp(this, `my-lambda-app-construct-${recordViewingsAppName}`, {
            name: recordViewingsAppName,
            routeKey: 'POST /videos/{videoId}',
            s3Bucket: myBaseInfra.s3Bucket,
            role: myBaseInfra.lambdaRole,
            apiId: apiGateway.api.id,
            apiExecutionArn: apiGateway.api.executionArn,
            authorizerId: apiGateway.authorizer.id,
        });
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


