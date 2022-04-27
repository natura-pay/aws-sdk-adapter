module.exports = {
    testEnvironment: 'node',
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node",
    ],
    testRegex: '(/unit/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    testPathIgnorePatterns: ["dist", "node_modules"],
    coverageDirectory: 'reports/coverage',
    testResultsProcessor: 'jest-sonar-reporter',
    collectCoverageFrom: [
        'lib/**/*.{ts,tsx,js,jsx}',
        '!lib/**/*.d.ts',
        '!lib/index.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    rootDir: '../'
};
