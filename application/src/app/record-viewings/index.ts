import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {logger} from "../../powertools/utitlities";
import {DynamoDB} from 'aws-sdk';

import {v4 as uuid} from 'uuid';

const dynamo: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

const handlerCreator = (dynamo: DynamoDB.DocumentClient) => async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const videoId = event.pathParameters!.videoId;
    if (videoId === undefined) {
        logger.warn('Missing \'videoId\' parameter in path while trying to create a product', {
            details: {eventPathParameters: event.pathParameters}
        });

        return {
            statusCode: 400,
            headers: {"content-type": "application/json"},
            body: JSON.stringify({message: "Missing 'videoId' parameter in path"}),
        };
    }

    try {
        const traceId = event.headers.traceId;
        const userId = event.headers.userId;
        let videoViewedEvent = {
            id: uuid(),
            type: 'VideoViewed',
            metadata: {
                traceId: traceId,
                userId: userId
            },
            data: {
                userId: userId,
                videoId: videoId
            }
        };
        await dynamo
            .put({
                TableName: "messages", // TODO: Extract als environment variable?
                Item: videoViewedEvent
            }).promise();

        return {
            statusCode: 200,
            headers: {"content-type": "application/json"},
            body: "",
        };

    } catch (error) {
        logger.error('Unexpected error occurred while trying to record a view', error);

        return {
            statusCode: 500,
            headers: {"content-type": "application/json"},
            body: JSON.stringify({
                message: error.message,
            }),
        };
    }
};

const handler = handlerCreator(dynamo);

export {
    handlerCreator,
    handler
};
