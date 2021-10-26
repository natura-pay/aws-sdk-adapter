export const mockSNSPromise: jest.Mock = jest.fn().mockReturnValue(Promise.resolve(true));

export const mockPublish = jest.fn().mockImplementation(() => ({ promise: mockSNSPromise }));

export class SNS {
    public publish = mockPublish;
}