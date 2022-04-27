import { SQS } from 'aws-sdk';
import { BaseConfigurationOptions } from '../base-configuration';
export class SQSAdapter {

    private sqsClient: SQS;

    constructor(configuration: BaseConfigurationOptions) {

        this.sqsClient = new SQS(configuration);
    }

    public async deleteMessage(queueArn: string, receiptHandle: string, customQueueUrl?: string): Promise<any> {

        const queueUrl = customQueueUrl ?? this.buildQueueUrlFromArn(queueArn);
        return await this.sqsClient.deleteMessage({
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
        }).promise();
    }

    public async sendMessage(queueUrl: string, message: any): Promise<any> {

        const messageResult: SQS.SendMessageResult = await this.sqsClient.sendMessage({
            MessageBody: JSON.stringify(message),
            QueueUrl: queueUrl
        }).promise();

        return {
            ...messageResult,
            createdAt: new Date().toISOString()
        };
    }

    private buildQueueUrlFromArn(queueArn: string): string {
        const region = queueArn.split(':')[3];
        const accountId = queueArn.split(':')[4];
        const queueName = queueArn.split(':')[5];
        const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

        return queueUrl;
    }

}
