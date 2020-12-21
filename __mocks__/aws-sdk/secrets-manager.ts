export const mockSecretsManagerReturn = jest.fn().mockReturnValue(Promise.resolve(true));

export const mockGetSecret = jest.fn().mockImplementation(() => ({ promise: mockSecretsManagerReturn }));

export class SecretsManager {
    public getSecretValue = mockGetSecret;
}