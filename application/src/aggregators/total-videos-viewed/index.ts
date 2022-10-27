import {DynamoDB} from "aws-sdk";
import {KinesisStreamEvent} from "aws-lambda/trigger/kinesis-stream";
import {logger} from "../../powertools/utilities";

const dynamo: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

const handlerCreator = (dynamo: DynamoDB.DocumentClient) => async (event: KinesisStreamEvent) => {
    try {
        const createPageDataIfNotExists = {
            TableName: 'pages',
            Key: {
                "page_name": "home"
            },
            UpdateExpression: "SET page_data = if_not_exists(page_data, {})",
            ReturnValues: "UPDATED_NEW"
        };
        await dynamo.update(createPageDataIfNotExists).promise();

        const updateVideosWatchedCounter = {
            TableName: 'pages',
            Key: {
                "page_name": "home"
            },
            UpdateExpression: "SET page_data.videos_watched = if_not_exists(page_data.videos_watched, :zero) + :increase",
            ExpressionAttributeValues: {
                ":increase": {"N": "1"},
                ":zero": {"N": "0"}
            },
            ReturnValues: "UPDATED_NEW"
        };
        await dynamo.update(updateVideosWatchedCounter).promise();
    } catch (error) {
        logger.error("Could not update videos watched home page data", {
            details: {
                event: JSON.stringify(event)
            }
        }, error)
    }

};

const handler = handlerCreator(dynamo);

export {
    handlerCreator,
    handler
};