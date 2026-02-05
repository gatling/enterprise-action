import { TS_EXT_TO_TREAT_AS_ESM, ESM_TS_TRANSFORM_PATTERN } from "ts-jest";
import type { Config } from "jest";

const jestConfig: Config = {
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/*.test.ts"],
  extensionsToTreatAsEsm: [...TS_EXT_TO_TREAT_AS_ESM],
  transform: {
    [ESM_TS_TRANSFORM_PATTERN]: ["ts-jest", { useESM: true }]
  },
  verbose: true,
  roots: ["<rootDir>"],
  modulePaths: ["./"],
  moduleNameMapper: {
    "^@src/(.*).js$": "<rootDir>/src/$1"
  }
};

export default jestConfig;
