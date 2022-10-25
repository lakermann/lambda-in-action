import {APIGatewayProxyResult} from "aws-lambda";

export const handler = async (): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: 'Hello from Lambda!',
    };
};

