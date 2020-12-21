export const mockSSMReturn = jest.fn().mockReturnValue(Promise.resolve(true));

export const mockGetParameter = jest.fn().mockImplementation(() => ({ promise: mockSSMReturn }));

export class SSM {
    public getParameter = mockGetParameter;
}