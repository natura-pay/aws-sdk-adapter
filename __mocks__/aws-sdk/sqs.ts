export const mockSQSPromise: jest.Mock = jest.fn().mockReturnValue(Promise.resolve(true));

export const mockDeleteMessage = jest.fn().mockImplementation(() => ({ promise: mockSQSPromise }));
export const mockSendMessage = jest.fn().mockImplementation(() => ({ promise: mockSQSPromise }));

export class SQS {
    public deleteMessage = mockDeleteMessage;
    public sendMessage = mockSendMessage;
}