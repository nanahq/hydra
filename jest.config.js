/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '((\\.|/)(e2e|test|spec))\\.[jt]sx?$',
  rootDir: ".",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "**/*.(t|j)s"
  ],
  coverageDirectory: "./coverage",
  roots: [
    "<rootDir>/apps/",
    "<rootDir>/libs/"
  ],
  moduleNameMapper: {
    "^@app/common(|/.*)$": "<rootDir>/libs/common/src/$1"
  },
  testTimeout: 180000
};
