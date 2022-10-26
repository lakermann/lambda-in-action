import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";

export default class MyDynamodbTable extends Construct {
    readonly dynamodbTable

    constructor(scope: Construct, id: string, hashKey: string, attribute: [{ name: string; type: string }]) {
        super(scope, id);

        this.dynamodbTable = new aws.dynamodbTable.DynamodbTable(this, id, {
            name: id,
            billingMode: "PAY_PER_REQUEST",
            hashKey: hashKey,
            attribute: attribute
        })
    }
}
