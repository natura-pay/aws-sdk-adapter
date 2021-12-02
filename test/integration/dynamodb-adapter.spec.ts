'use strict';

jest.deepUnmock('aws-sdk');
jest.unmock('aws-sdk/clients/dynamodb');

import { DynamoDBAdapter } from "../../lib/aws/dynamodb/dynamodb-adapter";
import { DynamoDBConfig } from "../../lib/aws/dynamodb/dynamodb-config";
import { mockDate } from "../mock-data";

describe('DynamoDB', () => {

    const dynamoDBConfig: DynamoDBConfig = {
        endpoint: 'http://localhost:4566',
        region: 'us-east-1',
        tableName: 'test-dev',
        ttl: 100,
    } as DynamoDBConfig;

    const dynamoDBAdapter: DynamoDBAdapter = new DynamoDBAdapter(dynamoDBConfig);
    const NOW = new Date('2021-09-09T00:00:00.00Z');
    const resetDateMock = mockDate(NOW);

    afterAll(() => {
        resetDateMock();
    });

    it('should put an item', async () => {

        const item = {
            Value: '1-Value',
            messageId: '1',
        };

        const response = await dynamoDBAdapter.put(item);

        expect(response).not.toBeUndefined();
        expect(response.ConsumedCapacity).toEqual({
            CapacityUnits: 1,
            TableName: 'test-dev'
        });
    });

    it('should query an item', async () => {
        const filter = {
            ExpressionAttributeValues: { ':key': '1' },
            KeyConditionExpression: 'messageId = :key',
        };

        const item = await dynamoDBAdapter.query(filter);

        expect(item).not.toBeUndefined();
        expect(item).toEqual({
            Count: 1,
            Items: [{
                Value: '1-Value',
                messageId: '1',
                ttl: Math.floor(NOW.getTime() / 1000)
                    + 10
                    + 100
            }],
            ScannedCount: 1,
        });
    });

    it('should update an item', async () => {
        const item = {
            ExpressionAttributeNames: {
                '#Value': 'Value'
            },
            ExpressionAttributeValues: {
                ':newValue': '2-Value'
            },
            Key: {
                messageId: '1',
            },
            UpdateExpression: 'set #Value = :newValue',
        };

        const response = await dynamoDBAdapter.update(item);

        expect(response).not.toBeUndefined();
        expect(response.ConsumedCapacity).toEqual({
            CapacityUnits: 1,
            TableName: 'test-dev'
        });
    });

    it('should query an item after update', async () => {
        const filter = {
            ExpressionAttributeValues: { ':key': '1' },
            KeyConditionExpression: 'messageId = :key',
        };

        const item = await dynamoDBAdapter.query(filter);

        expect(item).not.toBeUndefined();
        expect(item).toEqual({
            Count: 1,
            Items: [{
                Value: '2-Value',
                messageId: '1',
                ttl: Math.floor(NOW.getTime() / 1000)
                    + 10
                    + 100
            }],
            ScannedCount: 1,
        });
    });

});