'use strict';

jest.deepUnmock('aws-sdk');

import { SQS } from 'aws-sdk';
import { SQSAdapter } from '../../lib/aws/sqs/sqs-adapter';

describe('SQS', () => {

    const sqsAdapter = new SQSAdapter({endpoint: 'http://0.0.0.0:4566'});

    describe('deleteMessage', () => {
        it('should delete a messsage from a custom queue url provided', async () => {
            const customQueueUrl = 'http://0.0.0.0:4566/000000000000/custom-queue-test-dev';
    
            await sendMessageToQueue(customQueueUrl);
            const [message] = await receiveMessagesQueue(customQueueUrl);
            const receiptHandle = message.ReceiptHandle!;
    
            await sqsAdapter.deleteMessage('any-arn', receiptHandle, customQueueUrl);
            
            const queueMessagesAfterDelete = await receiveMessagesQueue(customQueueUrl);
    
            expect(queueMessagesAfterDelete.length).toEqual(0);
        });
    });
});

const sendMessageToQueue = async (queueUrl: string) => {
    const sqs = new SQS();

    return sqs.sendMessage({
        MessageBody: 'any message',
        QueueUrl: queueUrl
    }).promise();
};

const receiveMessagesQueue = async (queueUrl: string) => {
    const sqs = new SQS();

    const { Messages } = await sqs.receiveMessage({
        QueueUrl: queueUrl
    }).promise();

    return Messages ?? [];
};