import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";

export default class MyDynamodbTableConstruct extends Construct {
    constructor(scope: Construct, name: string, hashKey: string, attribute: [{ name: string; type: string }]) {
        super(scope, name);

        new aws.dynamodbTable.DynamodbTable(this, name, {
            name: name,
            billingMode: "PAY_PER_REQUEST",
            hashKey: hashKey,
            attribute: attribute
        })
    }
}
