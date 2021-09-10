import { SQS } from 'aws-sdk';
import { SQSAdapter } from '../../../lib/aws/sqs-adapter';
import { mockDeleteMessage, mockSQSPromise } from '../../../__mocks__/aws-sdk/sqs';

describe('SQSAdapter', () => {

    let sqsAdapter: SQSAdapter;
    const NOW = new Date();


    beforeAll(() => {
        sqsAdapter = new SQSAdapter();
        spyOn(global, 'Date').and.callFake(() => NOW);
    });

    beforeEach(() => {
        mockSQSPromise.mockClear();
        mockDeleteMessage.mockClear();
    });

    describe('deleteMessage', () => {
        it('should successfully resolve promise and delete message from SQS', async () => {
            mockSQSPromise.mockReturnValue(
                { promise: jest.fn().mockResolvedValue({}) }
            );
            const receipt = '????';
            const arn = 'arn:aws:sqs:us-east-1:1111111111:deleted-queue-dev';
            const expectedUrl = 'https://sqs.us-east-1.amazonaws.com/1111111111/deleted-queue-dev';

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
            ).rejects.toThrowError(Error);
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
            const expectedResult = {
                MD5OfMessageBody: 'Body MD5',
                MessageId: 'Returned MessageId',
                createdAt: NOW.toISOString()
            };

            mockSQSPromise.mockResolvedValue(mockedSendMessageResult);

            const result = await sqsAdapter.sendMessage(queueUrl, messageBody);

            expect(result).toStrictEqual(expectedResult);

            expect(mockSQSPromise).toHaveBeenCalledTimes(1);
        });

        it('should raise an error when the promise is rejected', async () => {
            mockSQSPromise.mockRejectedValue(new Error('Unexpected error'));
            await expect(sqsAdapter.sendMessage('', '')).rejects.toThrowError(Error);
        });

    });
});
