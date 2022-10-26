import {Construct} from "constructs";
import {App, S3Backend, TerraformStack} from "cdktf";

import * as aws from "@cdktf/provider-aws";
import * as random from "@cdktf/provider-random"
import MyDynamodbTable from "./constructs/my-dynamodb-table";
import MyBaseInfra from "./constructs/my-base-infra";
import MyLambdaApp from "./constructs/my-lambda-app";

class MyStack extends TerraformStack {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // providers
        const awsProvider = new aws.provider.AwsProvider(this, `${id}-aws-provider`, {
            region: 'us-east-1'
        });

        new random.provider.RandomProvider(this, `${id}-random-provider`, {});

        // S3 backend for state
        new S3Backend(this, {
            key: 'lambda-in-action',
            bucket: 'lambda-in-action',
            region: awsProvider.region,
        });

        // resources
        const myBaseInfra = new MyBaseInfra(this, `${id}-base-infra`);

        // TODO: Create proper construct (naming conventions, config, etc.)
        new MyDynamodbTable(this, "messages", "id", [{
            name: "id",
            type: "S"
        }])

        const apiTestAppName = 'api-test';
        new MyLambdaApp(this, `${id}-lambda-app-${apiTestAppName}`, {
            name: apiTestAppName,
            routeKey: 'GET /test',
            s3Bucket: myBaseInfra.s3Bucket,
            role: myBaseInfra.lambdaRole,
            apiId: myBaseInfra.apiGateway.api.id,
            apiExecutionArn: myBaseInfra.apiGateway.api.executionArn,
            authorizerId: myBaseInfra.apiGateway.authorizer.id,
        });

        const recordViewingsAppName = 'record-viewings';
        new MyLambdaApp(this, `${id}-lambda-app-${recordViewingsAppName}`, {
            name: recordViewingsAppName,
            routeKey: 'POST /videos/{videoId}',
            s3Bucket: myBaseInfra.s3Bucket,
            role: myBaseInfra.lambdaRole,
            apiId: myBaseInfra.apiGateway.api.id,
            apiExecutionArn: myBaseInfra.apiGateway.api.executionArn,
            authorizerId: myBaseInfra.apiGateway.authorizer.id,
        });
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


