import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";
import MyKinesisStream from "./my-kinesis-stream";

export interface MyDynamodbTableConfig {
    hashKey: string,
    attribute: [{ name: string; type: string }],
    kinesisStream: MyKinesisStream
}

export default class MyDynamodbTable extends Construct {
    readonly dynamodbTable

    constructor(scope: Construct, id: string, config: MyDynamodbTableConfig) {
        super(scope, id);

        this.dynamodbTable = new aws.dynamodbTable.DynamodbTable(this, `${id}-dynamodb-table`, {
            name: id,
            billingMode: "PAY_PER_REQUEST",
            hashKey: config.hashKey,
            attribute: config.attribute
        })

        new aws.dynamodbKinesisStreamingDestination.DynamodbKinesisStreamingDestination(this, `${id}-dynamodb-kinesis-stream-destination`, {
            streamArn: config.kinesisStream.stream.arn,
            tableName: this.dynamodbTable.name
        })
    }
}
