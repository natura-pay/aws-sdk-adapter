export const awsSdkPromiseResponse = jest.fn().mockResolvedValue(Promise.resolve(true));


export const putFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
export const updateFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
export const queryFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export class DocumentClient {
    public put = putFn;
    public update = updateFn;
    public query = queryFn
}

const createTableFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));
const listTablesFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export class DynamoDB {
    public createTable = createTableFn;
    public listTables = listTablesFn;
}