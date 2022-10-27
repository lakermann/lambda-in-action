import {Construct} from "constructs";

import * as path from "path";
import * as aws from "@cdktf/provider-aws";
import MyLambda, {lambdaRolePolicy} from "./my-lambda";
import MyMessageStore from "./my-message-store";
import MyDynamoDbTable from "./my-dynamo-db-table";

export interface MyLambdaAggregatorConfig {
    name: string,
    s3Bucket: aws.s3Bucket.S3Bucket,
    messageStore: MyMessageStore,
    viewData: MyDynamoDbTable
}

// TODO: this is rather generous, reduce permissions
const AWSLambdaKinesisExecutionRole = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kinesis:DescribeStream",
                "kinesis:DescribeStreamSummary",
                "kinesis:GetRecords",
                "kinesis:GetShardIterator",
                "kinesis:ListShards",
                "kinesis:ListStreams",
                "kinesis:SubscribeToShard",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}

export default class MyLambdaAggregator extends Construct {
    constructor(scope: Construct, id: string, config: MyLambdaAggregatorConfig) {
        super(scope, id);

        const functionName = `aggregator-${config.name}`;
        const assetSourcePath = path.resolve(__dirname, `../../application/dist/aggregators/${config.name}`);

        const awsLambdaExecutionInlinePolicy = {
            name: "aws-lambda-kinesis-execution-policy",
            policy: JSON.stringify(AWSLambdaKinesisExecutionRole)
        };

        const lambdaRole = new aws.iamRole.IamRole(this, `${id}-iam-role-lambda-execution`, {
            name: `lambda-execution-role-${functionName}`,
            assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
            inlinePolicy: [config.viewData.inlinePolicy, awsLambdaExecutionInlinePolicy]
        });

        const myLambda = new MyLambda(this, `${id}-my-lambda-function`, {
            functionName: functionName,
            assetSourcePath: assetSourcePath,
            s3Bucket: config.s3Bucket,
            role: lambdaRole
        });

        new aws.lambdaEventSourceMapping.LambdaEventSourceMapping(this, `${id}-lambda-event-source-mapping`, {
            eventSourceArn: config.messageStore.myKinesisStream.stream.arn,
            functionName: myLambda.lambdaFunction.functionName,
            startingPosition: 'LATEST',
        });
    }
}
