import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {logger} from "../../powertools/utilities";
import {DynamoDB} from 'aws-sdk';


const dynamo: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

const handlerCreator = (dynamo: DynamoDB.DocumentClient) => async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const pageId = event.pathParameters!.pageId;
    if (pageId === undefined) {
        logger.warn('Missing \'pageId\' parameter in path while trying to get a page', {
            details: {eventPathParameters: event.pathParameters}
        });

        return {
            statusCode: 400,
            headers: {"content-type": "application/json"},
            body: JSON.stringify({message: "Missing 'pageId' parameter in path"}),
        };
    }

    try {
        const page = await dynamo
            .get({
                TableName: "pages", // TODO: Extract als environment variable?
                Key: {"page_name": "home"}
            }).promise();

        return {
            statusCode: 200,
            headers: {"content-type": "application/json"},
            body: JSON.stringify(page),
        };

    } catch (error) {
        logger.error('Unexpected error occurred while trying to get a page', error);

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
