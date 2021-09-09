'use strict';

jest.deepUnmock('aws-sdk');
jest.unmock('aws-sdk/clients/dynamodb');

import { DynamoDBAdapter } from "../../lib/aws/dynamodb-adapter";
import { DynamoDBConfig } from "../../lib/aws/dynamodb-config";
import { mockDate } from "../mock-data";

describe('DynamoDB', () => {

    const dynamoDBConfig: DynamoDBConfig = {
        tableName: 'test-dev',
        ttl: 100,
        endpointUrl: 'http://localhost:4566'
    } as DynamoDBConfig;

    const dynamoDBAdapter: DynamoDBAdapter = new DynamoDBAdapter('us-east-1', dynamoDBConfig)
    const NOW = new Date('2021-09-09T00:00:00.00Z');
    let resetDateMock = mockDate(NOW);

    afterAll(() => {
        resetDateMock();
    })




    it('should put an item', async () => {

        const item = {
            messageId: '1',
            Value: '1-Value'
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
            KeyConditionExpression: 'messageId = :key',
            ExpressionAttributeValues: { ':key': '1' },
        };

        const item = await dynamoDBAdapter.query(filter);

        expect(item).not.toBeUndefined();
        expect(item).toEqual({
            Count: 1,
            Items: [{
                Value: '1-Value',
                messageId: '1',
                ttl: NOW.getTime() + 100
            }],
            ScannedCount: 1,
        });
    });

    it('should update an item', async () => {
        const item = {
            Key: {
                messageId: '1',
            },
            UpdateExpression: 'set #Value = :newValue',
            ExpressionAttributeNames: {
                '#Value': 'Value'
            },
            ExpressionAttributeValues: {
                ':newValue': '2-Value'
            }
        };

        const response = await dynamoDBAdapter.update(item);

        expect(response).not.toBeUndefined();
        expect(response.ConsumedCapacity).toEqual({
            CapacityUnits: 1,
            TableName: 'test-dev'
        });
    });

    it('should query an item after update', async () => {
        const NOW = new Date();
        spyOn(global, 'Date').and.callFake(() => NOW);
        const filter = {
            KeyConditionExpression: 'messageId = :key',
            ExpressionAttributeValues: { ':key': '1' },
        };

        const item = await dynamoDBAdapter.query(filter);

        expect(item).not.toBeUndefined();
        expect(item).toEqual({
            Count: 1,
            Items: [{
                Value: '2-Value',
                messageId: '1',
                ttl: NOW.getTime() + 100
            }],
            ScannedCount: 1,
        });
    });

});