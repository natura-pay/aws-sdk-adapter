
import { DynamoDBAdapter } from '../../../../lib/aws/dynamodb/dynamodb-adapter'
import { DynamoDBConfig } from '../../../../lib/aws/dynamodb/dynamodb-config';
import { awsSdkPromiseResponse, DocumentClient } from '../../../../__mocks__/aws-sdk/clients/dynamodb';

describe('DynamodbAdapter', () => {

    const NOW = new Date();

    let dynamodbAdapter: DynamoDBAdapter;
    const dynamoDBConfig = {
        region: 'us-east-1',
        tableName: 'test',
        ttl: 10,
    } as DynamoDBConfig;

    const db = new DocumentClient();

    beforeAll(() => {
        spyOn(global, 'Date').and.callFake(() => NOW);
        dynamodbAdapter = new DynamoDBAdapter(dynamoDBConfig);
    });

    afterEach(() => {
        awsSdkPromiseResponse.mockClear();
        db.update.mockClear();
        db.put.mockClear();
        db.query.mockClear();
    });

    describe('put', () => {
        it('should successfully put an item in DynamoDB', async () => {
            const item = {
                key: 'value'
            }

            const response = await dynamodbAdapter.put(item);

            expect(response).not.toBeNull();
            expect(response).toBeTruthy()

            expect(awsSdkPromiseResponse).toBeCalled()
            expect(db.put).toHaveBeenCalledWith({
                Item: {
                    key: "value",
                    ttl: NOW.getTime() + dynamoDBConfig.ttl,
                },
                TableName: "test"
            });
        });
    });

    describe('update', () => {
        it('should successfully update an item in DynamoDB', async () => {
            const params = {
                Key: {
                    identifier: 123
                }
            }

            const response = await dynamodbAdapter.update(params);

            expect(response).not.toBeNull();
            expect(response).toBeTruthy();

            expect(awsSdkPromiseResponse).toBeCalled();
            expect(db.update).toBeCalledWith({
                Key: {
                    identifier: 123
                },
                TableName: 'test'
            });

        });
    });

    describe('query', () => {
        it('should query an item woth successfull', async () => {

            awsSdkPromiseResponse.mockReturnValue({ Items: [{ key: '123' }] })

            const params = {
                IndexName: 'index',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {
                    id: '123'
                }
            };

            const items = (await dynamodbAdapter.query(params)).Items;

            expect(items).not.toBeNull();
            expect(items).toEqual([{ key: '123' }]);

            expect(awsSdkPromiseResponse).toBeCalled();
            expect(db.query).toBeCalledWith({
                TableName: 'test',
                IndexName: 'index',
                KeyConditionExpression: 'id = :id',
                ExpressionAttributeValues: {
                    id: '123'
                }
            })
        });
    });
});