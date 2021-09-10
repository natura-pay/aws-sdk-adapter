import { BaseConfigurationOptions } from "../base-configuration";

export interface DynamoDBConfig extends BaseConfigurationOptions {
    tableName: string;
    ttl: number;
}