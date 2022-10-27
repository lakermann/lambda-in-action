import {Construct} from "constructs";
import {App, S3Backend, TerraformStack} from "cdktf";

import * as aws from "@cdktf/provider-aws";
import * as random from "@cdktf/provider-random"
import MyMessageStore from "./constructs/my-message-store";
import MyBaseInfra from "./constructs/my-base-infra";
import MyLambdaApp from "./constructs/my-lambda-app";
import MyLambdaAggregator from "./constructs/my-lambda-aggregator";
import MyDynamoDbTable from "./constructs/my-dynamo-db-table";


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

        // TODO: Move message store to base infra?
        const myMessageStore = new MyMessageStore(this, "${id}-my-message-store");

        const myDynamoDbTablePageData = new MyDynamoDbTable(this, `${id}-my-dynamo-db-table-page-data`, {
            tableName: 'pages',
            hashKey: 'page_name',
            attribute: [{name: "page_name", type: "S"}],
        });

        // Apps
        const apiTestAppName = 'api-test';
        new MyLambdaApp(this, `${id}-lambda-app-${apiTestAppName}`, {
            name: apiTestAppName,
            routeKey: 'GET /test',
            s3Bucket: myBaseInfra.s3Bucket,
            messageStore: myMessageStore,
            apiGateway: myBaseInfra.apiGateway,
        });

        const recordViewingsAppName = 'record-viewings';
        new MyLambdaApp(this, `${id}-lambda-app-${recordViewingsAppName}`, {
            name: recordViewingsAppName,
            routeKey: 'POST /videos/{videoId}',
            s3Bucket: myBaseInfra.s3Bucket,
            messageStore: myMessageStore,
            apiGateway: myBaseInfra.apiGateway,
        });

        // Components
        // ...no componets yet...

        // Aggregators
        const totalVideosViewAggregatorName = 'total-videos-viewed';
        new MyLambdaAggregator(this, `${id}-lambda-aggregator-${totalVideosViewAggregatorName}`, {
            name: totalVideosViewAggregatorName,
            s3Bucket: myBaseInfra.s3Bucket,
            messageStore: myMessageStore,
            viewData: myDynamoDbTablePageData
        });
    }
}

const app = new App();
new MyStack(app, "lambda-in-action");
app.synth();


