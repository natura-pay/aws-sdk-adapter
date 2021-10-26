import { SSM } from './aws-sdk/ssm';
import { SecretsManager } from './aws-sdk/secrets-manager';
import { SQS } from './aws-sdk/sqs';
import { SNS } from './aws-sdk/sns';

export const config = {
    update: jest.fn()
};

export const DynamoDB = jest.fn().mockImplementation(() => { return {}; });

export { SQS };
export { SNS };
export { SSM };
export { SecretsManager };