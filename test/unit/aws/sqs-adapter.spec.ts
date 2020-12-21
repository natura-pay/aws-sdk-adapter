import { Container, Snapshot } from 'typescript-ioc';
import { SQS } from 'aws-sdk';
import { AwsError } from '../../../lib/erros';
import { SQSAdapter } from '../../../lib/aws/sqs-adapter';
import { mockDeleteMessage, mockSQSPromise } from '../../../__mocks__/aws-sdk/sqs';

describe('SQSAdapter', () => {

    let snapshot: Snapshot;
    let sqsAdapter: SQSAdapter;
    const NOW = new Date();


    beforeAll(() => {
        snapshot = Container.snapshot();
        sqsAdapter = Container.get(SQSAdapter);
        spyOn(global, 'Date').and.callFake(() => NOW);
    });

    beforeEach(() => {
        mockSQSPromise.mockClear();
        mockDeleteMessage.mockClear();
    });

    afterAll(() => {
        snapshot.restore();
    });

    describe('deleteMessage', () => {
        it('should successfully resolve promise and delete message from SQS', async () => {
            mockSQSPromise.mockReturnValue(
                { promise: jest.fn().mockResolvedValue({}) }
            );
            const receipt = '????';
            const arn = 'arn:aws:sqs:us-east-1:046038004735:financial-services-payment-boleto-messages-registry-response-dev';
            const expectedUrl = 'https://sqs.us-east-1.amazonaws.com/046038004735/financial-services-payment-boleto-messages-registry-response-dev';

            await sqsAdapter.deleteMessage(arn, receipt);

            expect(mockSQSPromise).toHaveBeenCalledTimes(1);
            expect(mockDeleteMessage).toHaveBeenCalledWith({
                QueueUrl: expectedUrl,
                ReceiptHandle: receipt,
            });
        });

        it('should raise an error when the promise is rejected', async () => {
            mockSQSPromise.mockRejectedValue(new Error('Unexpected error'));
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

            mockSQSPromise.mockResolvedValue(mockedSendMessageResult);

            const result = await sqsAdapter.sendMessage(queueUrl, messageBody);

            expect(result).toStrictEqual(expectedResult);

            expect(mockSQSPromise).toHaveBeenCalledTimes(1);
        });

        it('should raise an error when the promise is rejected', async () => {
            mockSQSPromise.mockRejectedValue(new Error('Unexpected error'));
            await expect(sqsAdapter.sendMessage('', '')).rejects.toThrowError(AwsError);
        });

    });
});
