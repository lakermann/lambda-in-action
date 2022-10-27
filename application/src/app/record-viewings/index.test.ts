import {APIGatewayProxyEvent} from "aws-lambda";
import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayEventIdentity,
    APIGatewayEventRequestContextWithAuthorizer
} from "aws-lambda/common/api-gateway";

const {handlerCreator} = require('./index.ts');

describe('RecordViewingsHandler', () => {

    const documentClientPutMock = jest.fn();

    const documentClientMock = {
        put: documentClientPutMock,
    };

    const handler = handlerCreator(documentClientMock);

    beforeEach(() => {
        documentClientPutMock.mockReset();
    });

    test('missing videoId fails and API call returns status 400', () => {
        const event = createTestEvent(undefined, 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "{\"message\":\"Missing 'videoId' parameter in path\"}",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 400,
        });
    });

    test('message saving in DynamoDB fails and API call returns status 500', () => {

        //documentClientPutMock.mockRejectedValue(new Error('DynamoDB call failed'));
        documentClientPutMock.mockImplementation(() => {
            return {
                promise() {
                    return Promise.reject(new Error('DynamoDB call failed'));
                }
            };
        })
        const event = createTestEvent('test-video-id', 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "{\"message\":\"DynamoDB call failed\"}",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 500,
        });
    });

    test('message is saved in DynamoDB and API call returns successfully', () => {
        documentClientPutMock.mockImplementation(() => {
            return {
                promise() {
                    return Promise.resolve({});
                }
            };
        })

        const event = createTestEvent('test-video-id', 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        expect(documentClientPutMock.mock.calls.length).toBe(1);
        expect(documentClientPutMock.mock.calls[0][0].TableName).toBe('messages');
        expect(documentClientPutMock.mock.calls[0][0].Item.id).toBeDefined();
        expect(documentClientPutMock.mock.calls[0][0].Item.type).toBe('VideoViewed');
        expect(documentClientPutMock.mock.calls[0][0].Item.metadata.traceId).toBe('test-trace-id');
        expect(documentClientPutMock.mock.calls[0][0].Item.metadata.userId).toBe('test-user-id');
        expect(documentClientPutMock.mock.calls[0][0].Item.data.videoId).toBe('test-video-id');
        expect(documentClientPutMock.mock.calls[0][0].Item.data.userId).toBe('test-user-id');

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 200,
        });
    });

    const createTestEvent = (videoId: string|undefined, traceId: string, userId: string): APIGatewayProxyEvent => {
        const identity: APIGatewayEventIdentity = {
            accessKey: null,
            accountId: null,
            apiKey: null,
            apiKeyId: null,
            caller: null,
            clientCert: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            principalOrgId: null,
            sourceIp: "",
            user: null,
            userAgent: null,
            userArn: null
        };
        const requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> = {
            accountId: "",
            apiId: "",
            authorizer: undefined,
            httpMethod: "",
            identity: identity,
            path: "",
            protocol: "",
            requestId: "",
            requestTimeEpoch: 0,
            resourceId: "",
            resourcePath: "",
            stage: ""
        };
        return {
            body: null,
            headers: {
                traceid: traceId,
                userid: userId
            },
            multiValueHeaders: {},
            httpMethod: "",
            isBase64Encoded: false,
            path: "",
            pathParameters: {
                videoId: videoId
            },
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null,
            requestContext: requestContext,
            resource: ""
        };
    }
})

