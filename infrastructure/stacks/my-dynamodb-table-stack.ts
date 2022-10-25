import * as aws from "@cdktf/provider-aws";
import {Construct} from "constructs";

export default class MyDynamodbTableStack {
    constructor(scope: Construct, name: string, hashKey: string, attribute: [{ name: string; type: string }]) {
        new aws.dynamodbTable.DynamodbTable(scope, name, {
            name: name,
            billingMode: "PAY_PER_REQUEST",
            hashKey: hashKey,
            attribute: attribute
        })
    }
}
