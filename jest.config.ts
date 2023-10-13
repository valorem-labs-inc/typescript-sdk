/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  roots: ['src', 'test'],
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  workerThreads: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        useESM: true,
      },
    ],
  },
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/**/*.{js,ts}'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  injectGlobals: true,
};
