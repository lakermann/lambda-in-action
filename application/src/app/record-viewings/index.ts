const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json"
    };

    try {
        let requestJSON = event.body
        await dynamo
            .put({
                TableName: "messages-sam",
                Item: {
                    id: requestJSON.id,
                    type: requestJSON.type,
                    metadata: {
                        traceId: requestJSON.metadata.traceId,
                        userId: requestJSON.metadata.userId
                    },
                    data: {
                        ownerId: requestJSON.data.ownerId,
                        sourceUri: requestJSON.data.sourceUri,
                        videoId: requestJSON.data.videoId
                    }
                }
            })
            .promise();
        body = `Put item ${requestJSON.id}`;

    } catch (err) {
        statusCode = 400;
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers
    };
};
