import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { AwsConfig } from '../aws-config';
import { DynamoDBConfig } from './dynamodb-config';


export class DynamoDBAdapter {

    private documentClient: DynamoDB.DocumentClient;
    private tableName: string;
    private ttl: number;

    constructor(dynamodbConfig: DynamoDBConfig, awsConfig?: AwsConfig) {
        const config = {
            convertEmptyValues: true,
            endpoint: dynamodbConfig.endpointUrl,
            httpOptions: dynamodbConfig.httpOptions,
            maxRetries: dynamodbConfig.maxRetries,
            region: awsConfig?.region || process.env['AWS_REGION'],
        };

        this.tableName = dynamodbConfig.tableName;
        this.ttl = dynamodbConfig.ttl;
        this.documentClient = new DocumentClient(config);

    }

    public async put(item: any) {
        const params: DynamoDB.PutItemInput = {
            Item: {
                ...item,
                ttl: (new Date()).getTime() + this.ttl,
            },
            TableName: this.tableName
        };

        return await this.documentClient.put(params).promise();
    }

    public async update(item: any) {
        const params: DynamoDB.UpdateItemInput = {
            TableName: this.tableName,
            ...item
        };
        return await this.documentClient.update(params).promise();
    }

    public async query(params: any) {
        const query: DynamoDB.QueryInput = {
            TableName: this.tableName,
            ...params
        };

        return await this.documentClient.query(query).promise();
    }
}