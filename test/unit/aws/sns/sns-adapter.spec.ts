import { SNSAdapter } from "../../../../lib/aws/sns/sns-adapter";
import { SNSConfig } from "../../../../lib/aws/sns/sns-config";
import { mockSNSPromise, SNS } from "../../../../__mocks__/aws-sdk/sns";

describe('SNS', () => {
    let snsAdapter: SNSAdapter;
    const snsConfig: SNSConfig = {
        url: "http://localhost"
    };
    const sns = new SNS();

    beforeAll(() => {
        snsAdapter = new SNSAdapter(snsConfig);
    });

    afterEach(() => {
        mockSNSPromise.mockClear();
        sns.publish.mockClear();
    });

    describe('publish', () => {
        it('should publish a message', async () => {
            mockSNSPromise.mockReturnValueOnce(Promise.resolve({
                MessageId: '12345'
            }));

            const message = { message: "a message" };
            const messageId = await snsAdapter.publish(message);

            expect(messageId).not.toBeUndefined();
            expect(sns.publish).toBeCalledWith({
                Message: JSON.stringify(message),
                MessageAttributes: undefined,
                TopicArn: "http://localhost"
            });
        });

        it('should publish a string message', async () => {
            mockSNSPromise.mockReturnValueOnce(Promise.resolve({
                MessageId: '12345'
            }));

            const messageId = await snsAdapter.publish("a simple message");

            expect(messageId).not.toBeUndefined();
            expect(sns.publish).toBeCalledWith({
                Message: "a simple message",
                MessageAttributes: undefined,
                TopicArn: "http://localhost"
            });
        });

        it('should publish a message eith MessageType', async () => {
            mockSNSPromise.mockReturnValueOnce(Promise.resolve({
                MessageId: '12345'
            }));

            const messageAttribute = {
                eventType: {
                    DataType: "String",
                    StringValue: "SENT"
                }
            };
            const messageId = await snsAdapter.publish("a simple message", messageAttribute);

            expect(messageId).not.toBeUndefined();
            expect(sns.publish).toBeCalledWith({
                Message: "a simple message",
                MessageAttributes: messageAttribute,
                TopicArn: "http://localhost"
            });
        });
    });
});