import {Construct} from "constructs";
import * as aws from "@cdktf/provider-aws";

export interface MyDynamoDbTableConfig {
    tableName: string,
    hashKey: string,
    attribute: [{ name: string; type: string }]
}

export default class MyDynamoDbTable extends Construct {
    readonly dynamodbTable: aws.dynamodbTable.DynamodbTable;
    readonly inlinePolicy: aws.iamRole.IamRoleInlinePolicy;

    constructor(scope: Construct, id: string, config: MyDynamoDbTableConfig) {
        super(scope, id);

        this.dynamodbTable = new aws.dynamodbTable.DynamodbTable(this, `${id}-dynamodb-table`, {
            name: config.tableName,
            billingMode: "PAY_PER_REQUEST",
            hashKey: config.hashKey,
            attribute: config.attribute
        });

        // TODO: More fine granular policies
        const dynamoDbAccesTablePolicy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": [
                        "dynamodb:GetItem",
                        "dynamodb:PutItem",
                        "dynamodb:UpdateItem"
                    ],
                    "Effect": "Allow",
                    "Resource": `${this.dynamodbTable.arn}`
                }
            ]
        };

        this.inlinePolicy = {
            name: `${config.tableName}-access-table-policy`,
            policy: JSON.stringify(dynamoDbAccesTablePolicy)
        };
    }

}