import { Factory, ObjectFactory, Singleton } from 'typescript-ioc';
import { SQS } from 'aws-sdk';
import { AwsError } from '../erros';

const sqsAdapterFactory: ObjectFactory = () => {
    const awsConfig = { region: process.env['AWS_REGION'] };

    const sqs: SQS = new SQS(awsConfig);
    return new SQSAdapter(sqs);
};


@Factory(sqsAdapterFactory)
@Singleton
export class SQSAdapter {

    private sqsClient: SQS;

    constructor(client: SQS) {
        this.sqsClient = client;
    }

    public async deleteMessage(queueArn: string, receiptHandle: string): Promise<any> {
        try {
            const queueUrl = this.buildQueueUrlFromArn(queueArn);
            await this.sqsClient.deleteMessage({
                QueueUrl: queueUrl,
                ReceiptHandle: receiptHandle,
            }).promise();
        } catch (error) {

            throw new AwsError(error.message);
        }
    }

    private buildQueueUrlFromArn(queueArn: string): string {
        const region = queueArn.split(':')[3];
        const accountId = queueArn.split(':')[4];
        const queueName = queueArn.split(':')[5];
        const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;

        return queueUrl;
    }

    public async sendMessage(queueUrl: string, message: any): Promise<any> {
        try {
            const messageResult: SQS.SendMessageResult = await this.sqsClient.sendMessage({
                MessageBody: JSON.stringify(message),
                QueueUrl: queueUrl
            }).promise();

            return {
                messageId: messageResult.MessageId,
                createdAt: new Date().toISOString()
            };
        } catch (error) {

            throw new AwsError(error.message);
        }
    }

}
