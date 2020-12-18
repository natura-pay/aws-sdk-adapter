jest.mock('aws-sdk');

import { Container, Snapshot } from 'typescript-ioc';
import { SQS } from 'aws-sdk';
import { AwsError } from '../../../lib/erros';
import { SQSAdapter } from '../../../lib/aws/sqs-adapter';
// import { mockDate, mockMethods, mockProperties } from '../../mock-util';

const mockSQSClient: jest.Mock = SQS as any;
// const timeFreeze = new Date('2121-02-02T00:00:00.000Z');

describe('SQSAdapter', () => {

    let snapshot: Snapshot;
    const mockPromiseResult: jest.Mock = jest.fn();
    let mockLoggerInfo: jest.Mock;
    let mockLoggerError: jest.Mock;
    let sqsAdapter: SQSAdapter;
    const NOW = new Date();


    class MockSQS {
        public deleteMessage(_: any, __: any) {
            return mockPromiseResult(_, __);
        }

        public sendMessage(_: any, __: any) {
            return mockPromiseResult(_, __);
        }
    }

    beforeAll(() => {
        snapshot = Container.snapshot();
        mockSQSClient.mockImplementation(() => new MockSQS());
        sqsAdapter = Container.get(SQSAdapter);
        spyOn(global, 'Date').and.callFake(() => NOW);
    });

    beforeEach(() => {
        mockSQSClient.mockClear();
        mockPromiseResult.mockClear();
    });

    afterAll(() => {
        snapshot.restore();
    });

    describe('deleteMessage', () => {
        it('should successfully resolve promise and delete message from SQS', async () => {
            mockPromiseResult.mockReturnValue(
                { promise: jest.fn().mockResolvedValue({}) }
            );
            const receipt = '????';
            const arn = 'arn:aws:sqs:us-east-1:046038004735:financial-services-payment-boleto-messages-registry-response-dev';
            const expectedUrl = 'https://sqs.us-east-1.amazonaws.com/046038004735/financial-services-payment-boleto-messages-registry-response-dev';

            await sqsAdapter.deleteMessage(arn, receipt);

            expect(mockPromiseResult).toHaveBeenCalledTimes(1);
            expect(mockPromiseResult).toHaveBeenCalledWith({
                QueueUrl: expectedUrl,
                ReceiptHandle: receipt,
            }, undefined);
        });

        it('should raise an error when the promise is rejected', async () => {
            mockPromiseResult.mockReturnValue(
                { promise: jest.fn().mockRejectedValue(new Error('Unexpected error')) }
            );
            await expect(
                sqsAdapter.deleteMessage('', '')
            ).rejects.toThrowError(AwsError);
        });
    });

    describe('sendMessage', () => {
        it('should successfully resolve promise and send message to SQS', async () => {
            const mockedSendMessageResult: SQS.SendMessageResult = {
                MD5OfMessageBody: 'Body MD5',
                MessageId: 'Returned MessageId'
            };
            const expectedLoggedMessage = {
                messageBodyMd5: mockedSendMessageResult.MD5OfMessageBody,
                messageId: mockedSendMessageResult.MessageId
            };

            const messageBody = { key: 'value' };
            const queueUrl = 'sqs url';
            const expectedParams = {
                MessageBody: JSON.stringify(messageBody),
                QueueUrl: queueUrl
            };

            const expectedResult = {
                messageId: mockedSendMessageResult.MessageId,
                createdAt: NOW.toISOString()
            };

            mockPromiseResult.mockReturnValue(
                { promise: jest.fn().mockResolvedValue(mockedSendMessageResult) }
            );

            const result = await sqsAdapter.sendMessage(queueUrl, messageBody);

            expect(result).toStrictEqual(expectedResult);

            expect(mockPromiseResult).toHaveBeenCalledTimes(1);
            expect(mockPromiseResult).toHaveBeenCalledWith(expectedParams, undefined);

            expect(mockLoggerInfo).toHaveBeenCalledTimes(3);
            expect(mockLoggerInfo).toHaveBeenNthCalledWith(1, `Queuing message to queue ${queueUrl}`);
            expect(mockLoggerInfo).toHaveBeenNthCalledWith(3, `Message successfully queued`, expectedLoggedMessage);
        });

        it('should raise an error when the promise is rejected', async () => {
            mockPromiseResult.mockReturnValue(
                { promise: jest.fn().mockRejectedValue(new Error('Unexpected error')) }
            );
            await expect(
                sqsAdapter.sendMessage('', '')
            ).rejects.toThrowError(AwsError);

            expect(mockLoggerInfo).toHaveBeenCalledTimes(2);
            expect(mockLoggerInfo).toHaveBeenNthCalledWith(1, `Queuing message to queue `);

            expect(mockLoggerError).toHaveBeenCalledTimes(1);
            expect(mockLoggerError).toHaveBeenNthCalledWith(1, `Error while sending message to SQS: Unexpected error`);
        });

    });
});
