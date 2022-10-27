import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";
import MyKinesisStream from "./my-kinesis-stream";
import MyDynamoDbTable from "./my-dynamo-db-table";

export default class MyMessageStore extends Construct {
    readonly myDynamoDbTable: MyDynamoDbTable;
    readonly myKinesisStream: MyKinesisStream;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.myDynamoDbTable = new MyDynamoDbTable(this, `${id}-dynamodb-table`, {
            tableName: 'messages',
            hashKey: "id",
            attribute: [{name: "id", type: "S"}],
        });

        this.myKinesisStream = new MyKinesisStream(this, `${id}-my-kinesis-message-stream`, {
            streamName: "messages-stream"
        });

        new aws.dynamodbKinesisStreamingDestination.DynamodbKinesisStreamingDestination(this, `${id}-dynamodb-kinesis-stream-destination`, {
            streamArn: this.myKinesisStream.stream.arn,
            tableName: this.myDynamoDbTable.dynamodbTable.name
        });

    }
}
