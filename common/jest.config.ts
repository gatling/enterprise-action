import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";

const { compilerOptions } = require("./tsconfig.json");

const jestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  verbose: true,
  roots: ["<rootDir>"],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
};

export default jestConfig;
