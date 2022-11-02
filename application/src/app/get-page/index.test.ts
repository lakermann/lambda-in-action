import {APIGatewayProxyEvent} from "aws-lambda";
import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayEventIdentity,
    APIGatewayEventRequestContextWithAuthorizer
} from "aws-lambda/common/api-gateway";

const {handlerCreator} = require('./index.ts');

describe('GetPageHandler', () => {

    const documentClientGetMock = jest.fn();

    const documentClientMock = {
        get: documentClientGetMock,
    };

    const handler = handlerCreator(documentClientMock);

    beforeEach(() => {
        documentClientGetMock.mockReset();
    });

    test('missing pageId fails and API call returns status 400', () => {
        const event = createTestEvent(undefined, 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "{\"message\":\"Missing 'pageId' parameter in path\"}",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 400,
        });
    });


    test('fetching an page from DynamoDB fails and API call returns status 500', () => {
        documentClientGetMock.mockImplementation(() => {
            return {
                promise() {
                    return Promise.reject(new Error('DynamoDB call failed'));
                }
            };
        })
        const event = createTestEvent('test-page-id', 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "{\"message\":\"DynamoDB call failed\"}",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 500,
        });
    });

    test('fetching an page that does not exists and API call returns status 404', () => {
        documentClientGetMock.mockImplementation(() => {
            return {
                promise() {
                    return Promise.resolve({});
                }
            };
        })
        const event = createTestEvent('test-page-id', 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "{\"message\":\"{\\\"message\\\":\\\"'pageId' not found\\\"}\"}",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 404,
        });
    });

    test('page is fetched from DynamoDB and API call returns successfully', () => {
        documentClientGetMock.mockImplementation(() => {
            return {
                promise() {
                    return Promise.resolve({
                        Item: {
                            page_data: {videoswatched: 10},
                            page_name: 'test-page-id',
                        }
                    });
                }
            };
        })

        const event = createTestEvent('test-page-id', 'test-trace-id', 'test-user-id');
        const apiGatewayProxyResultPromise = handler(event);

        expect(documentClientGetMock.mock.calls.length).toBe(1);
        expect(documentClientGetMock.mock.calls[0][0].TableName).toBe('pages');
        expect(documentClientGetMock.mock.calls[0][0].Key).toBeDefined();
        expect(documentClientGetMock.mock.calls[0][0].Key.page_name).toBe('test-page-id');

        return expect(apiGatewayProxyResultPromise).resolves.toEqual({
            body: "{\"page_data\":{\"videoswatched\":10},\"page_name\":\"test-page-id\"}",
            headers: {
                "content-type": "application/json"
            },
            statusCode: 200,
        });
    });

    const createTestEvent = (pageId: string | undefined, traceId: string, userId: string): APIGatewayProxyEvent => {
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
                pageId: pageId
            },
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null,
            requestContext: requestContext,
            resource: ""
        };
    }
})

