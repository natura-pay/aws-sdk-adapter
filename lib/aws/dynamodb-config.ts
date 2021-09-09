export interface DynamoDBConfig {
    tableName: string;
    ttl: number;
    endpointUrl?: string;
    maxRetries?: number
    httpOptions?: { [key: string]: any }
}