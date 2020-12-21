import { SSM } from './aws-sdk/ssm';
import { SecretsManager } from './aws-sdk/secrets-manager';
import { SQS } from './aws-sdk/sqs';

export const config = {
    update: jest.fn()
};

export const DynamoDB = jest.fn().mockImplementation(() => { return {}; });
export const SNS = jest.fn().mockImplementation(() => { return {}; });

export { SQS };
export { SSM };
export { SecretsManager };