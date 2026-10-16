/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // ⚠️ Stub manual de @prisma/client para testes não dependerem de generate
    '^@prisma/client$': '<rootDir>/src/__mocks__/prisma-client.ts',
  },
  setupFiles: ['<rootDir>/src/__mocks__/setup.ts'],
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/routes/**/*.ts',
    '!src/server.ts',
  ],
};
