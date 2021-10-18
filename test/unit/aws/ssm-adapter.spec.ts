import { BaseConfigurationOptions } from '../../../lib/aws/base-configuration';
import { SSMAdapter } from '../../../lib/aws/ssm/ssm-adapter';
import { SSM } from '../../../__mocks__/aws-sdk';
import { mockSSMReturn } from '../../../__mocks__/aws-sdk/ssm';


describe('SSMAdapter', () => {
    let ssmAdapter: SSMAdapter;
    const awsConfig: BaseConfigurationOptions = {
        endpoint: 'http://localhost'
    }
    const ssm = new SSM();

    beforeAll(() => {
        ssmAdapter = new SSMAdapter(awsConfig);
    });

    afterEach(() => {
        ssm.getParameter.mockClear();
    });

    describe('getJsonParameter', () => {
        it('should successfully resolve promise and retrieved parameters', async () => {
            const parameterStoreFixture = {
                Parameter: {
                    Name: '/aws/parameter-store-name/my-app/config',
                    Type: 'String',
                    Value: `{"key": "value"}`,
                    DataType: 'text'
                }
            };

            mockSSMReturn.mockReturnValue(parameterStoreFixture)
            const result = await ssmAdapter.getJsonParameter('/aws/parameter-store-name/my-app/config');

            expect(ssm.getParameter).toHaveBeenCalledTimes(1);
            expect(ssm.getParameter).toHaveBeenCalledWith(
                { Name: '/aws/parameter-store-name/my-app/config', WithDecryption: true }
            );
            expect(result).toEqual({ 'key': 'value' });
        });

        it('it should raise exception while failing to parse invalid JSON', async () => {
            const parameterStoreFixture = {
                Parameter: {
                    Name: '/aws/parameter-store-name/my-app/config',
                    Type: 'String',
                    Value: `"invalid": "json" : "formatting"`,
                    DataType: 'text'
                }
            };

            mockSSMReturn.mockReturnValue(parameterStoreFixture)
            await expect(
                ssmAdapter.getJsonParameter('/aws/parameter-store-name/my-app/config')
            ).rejects.toThrowError(SyntaxError('Unexpected end of JSON input! Your JSON might have a wrong formatting'));
            expect(ssm.getParameter).toHaveBeenCalledTimes(1);
            expect(ssm.getParameter).toHaveBeenCalledWith(
                { Name: '/aws/parameter-store-name/my-app/config', WithDecryption: true }
            );

        });
    });

    describe('getStringParameter()', () => {
        it('should successfully resolve promise and retrieve STRING parameter', async () => {
            const parameterStoreFixture = {
                Parameter: {
                    Name: '/aws/parameter-store-name/my-app/config',
                    Type: 'String',
                    Value: `this is a secure-string`,
                    DataType: 'text'
                }
            };

            mockSSMReturn.mockReturnValue(parameterStoreFixture)
            const result = await ssmAdapter.getStringParameter('/aws/parameter-store-name/my-app/config');

            expect(ssm.getParameter).toHaveBeenCalledTimes(1);
            expect(ssm.getParameter).toHaveBeenCalledWith(
                { Name: '/aws/parameter-store-name/my-app/config', WithDecryption: true }
            );
            expect(result).toEqual('this is a secure-string');
        });
    });

    describe('getParameter', () => {
        it('should raise an error when the promise is rejected', async () => {
            mockSSMReturn.mockRejectedValue(
                new Error('Unexpected error')
            );

            await expect(
                ssmAdapter.getParameter('blah')
            ).rejects.toThrowError(Error);
        });

        it('should raise an error when the value is an empty string', async () => {
            const parameterStoreFixture = {
                Parameter: {
                    Name: '/aws/parameter-store-name/my-app/config',
                    Type: 'String',
                    Value: '',
                    DataType: 'text'
                }
            };

            mockSSMReturn.mockReturnValue(parameterStoreFixture)

            await expect(
                ssmAdapter.getParameter('/aws/parameter-store-name/my-app/config')
            ).rejects.toThrowError(Error('The parameter value is either empty or undefined'));
            expect(ssm.getParameter).toHaveBeenCalledTimes(1);
            expect(ssm.getParameter).toHaveBeenCalledWith(
                { Name: '/aws/parameter-store-name/my-app/config', WithDecryption: true }
            );
        });

        it('should raise an error when the value is undefined', async () => {
            const parameterStoreFixture = {
                Parameter: {
                    Name: '/aws/parameter-store-name/my-app/config',
                    Type: 'String',
                    Value: undefined,
                    DataType: 'text'
                }
            };

            mockSSMReturn.mockReturnValue(parameterStoreFixture)

            await expect(
                ssmAdapter.getParameter('/aws/parameter-store-name/my-app/config')
            ).rejects.toThrowError(Error('The parameter value is either empty or undefined'));
            expect(ssm.getParameter).toHaveBeenCalledTimes(1);
            expect(ssm.getParameter).toHaveBeenCalledWith(
                { Name: '/aws/parameter-store-name/my-app/config', WithDecryption: true }
            );
        });
    });
});
