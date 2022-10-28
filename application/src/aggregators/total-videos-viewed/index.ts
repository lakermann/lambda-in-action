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
            UpdateExpression: "SET page_data = if_not_exists(page_data, :empty)",
            ExpressionAttributeValues: {
                ":empty": {},
            },
            ReturnValues: "UPDATED_NEW"
        };
        await dynamo.update(createPageDataIfNotExists).promise();
        // TODO: We may get multiple records per event

        // TODO: Make update idempotent --> use global position (does not exist yet)
        /* Original query was:
      UPDATE
        pages
      SET
        page_data = jsonb_set(
          jsonb_set(
            page_data,
            '{videosWatched}',
            ((page_data ->> 'videosWatched')::int + 1)::text::jsonb
          ),
          '{lastViewProcessed}',
          :globalPosition::text::jsonb
        )
      WHERE
        page_name = 'home' AND
        (page_data->>'lastViewProcessed')::int < :globalPosition
         */

        const updateVideosWatchedCounter = {
            TableName: 'pages',
            Key: {
                "page_name": "home"
            },
            UpdateExpression: "SET page_data.videoswatched = if_not_exists(page_data.videoswatched, :start) + :inc",
            ExpressionAttributeValues: {
                ':inc': 1,
                ':start': 0,
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

        throw error; // re-throw to ensure Lambda is not considered successful
    }

};

const handler = handlerCreator(dynamo);

export {
    handlerCreator,
    handler
};
