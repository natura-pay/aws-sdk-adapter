export class AwsError extends Error {
    public readonly code: string = 'AwsError';
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AwsError.prototype);
    }
}
