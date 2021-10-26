import { SNS } from 'aws-sdk';
import { SNSConfig } from './sns-config';
export class SNSAdapter {

    private snsClient: SNS;
    private url: string;

    constructor(configuration: SNSConfig) {
        this.url = configuration.url;
        this.snsClient = new SNS(configuration);
    }

    public async publish(message: any, messageAttributes?: any) {
        const snsData = {
            Message: typeof message === 'string' ? message : JSON.stringify(message),
            MessageAttributes: messageAttributes,
            TopicArn: this.url,
        };

        return (await this.snsClient.publish(snsData).promise()).MessageId;
    }
}