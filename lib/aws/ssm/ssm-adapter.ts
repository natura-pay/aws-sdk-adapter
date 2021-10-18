import { SSM } from 'aws-sdk';
import { BaseConfigurationOptions } from '../base-configuration';

export class SSMAdapter {

    private ssmClient: SSM;

    constructor(configuration: BaseConfigurationOptions) {
        this.ssmClient = new SSM(configuration);
    }

    public async getJsonParameter(parameterName: string) {
        const parameter:string = await this.getParameter(parameterName);
        try{
            return JSON.parse(parameter);
        }catch(err){
            throw SyntaxError('Unexpected end of JSON input! Your JSON might have a wrong formatting')
        }
    }

    public async getStringParameter(parameterName: string) {
        return this.getParameter(parameterName);
    }

    public async getParameter(parameterName: string): Promise<string> {
            const result: SSM.GetParameterResult = await this.ssmClient.getParameter(
                { Name: parameterName, WithDecryption: true }
            ).promise();

            if(!result.Parameter || !result.Parameter.Value){
                throw Error('The parameter value is either empty or undefined');
            }

            return result.Parameter?.Value as string;
    }
}
