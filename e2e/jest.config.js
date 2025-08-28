module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'e2e/reports',
        outputName: 'e2e-results.xml',
        suiteName: 'E2E Tests'
      }
    ]
  ],
  testEnvironment: './e2e/environment',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts']
}