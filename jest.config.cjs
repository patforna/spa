module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
