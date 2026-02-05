import { boolean, dictionary, Err, number, object, Ok, Result, string, union } from "idonttrustlikethat";

import { ApiClientConfig } from "./client/apiClient.js";

export interface Config {
  gatlingEnterpriseUrl: string;
  api: ApiClientConfig;
  run: RunConfig;
  failActionOnRunFailure: boolean;
  waitForRunEnd: boolean;
  runSummaryLoggingConfiguration: RunSummaryLoggingConfiguration;
}

export interface RunConfig {
  simulationId: string;
  extraSystemProperties?: Record<string, string>;
  extraEnvironmentVariables?: Record<string, string>;
  overrideLoadGenerators?: Record<string, LoadGeneratorConfiguration>;
  title?: string;
  description?: string;
}

export interface LoadGeneratorConfiguration {
  size: number;
  weight?: number;
}

export interface RunSummaryLoggingConfiguration {
  enabled: boolean;
  initialRefreshInterval: number;
  initialRefreshCount: number;
  refreshInterval: number;
}

export const requiredInputValidation = string.filter((str) => str !== "");
export const optionalInputValidation = string.map((str) => (str === "" ? undefined : str));
export const requiredBooleanValidation = requiredInputValidation.and((str) => {
  const lowerCaseStr = str.toLowerCase();
  return lowerCaseStr === "true"
    ? Ok(true)
    : lowerCaseStr === "false"
      ? Ok(false)
      : Err(`Invalid boolean value: ${str}`);
});
export const jsonValidation = string.and((str): Result<string, any> => {
  try {
    return Ok(JSON.parse(str));
  } catch (e) {
    if (e instanceof Error) {
      return Err(`Invalid JSON. ${e.name}: ${e.message}`);
    }
    throw e;
  }
});

const configKeyValueValidation = union(string, number, boolean).map((value) =>
  typeof value === "string" ? value : `${value}`
);
const configKeysValidation = jsonValidation.then(dictionary(string, configKeyValueValidation));
export const configKeysInputValidation = optionalInputValidation.then(configKeysValidation.optional());
const overrideLoadGeneratorsValidation = jsonValidation.then(
  dictionary(requiredInputValidation, object({ size: number, weight: number.optional() }))
);
export const overrideLoadGeneratorsInputValidation = optionalInputValidation.then(
  overrideLoadGeneratorsValidation.optional()
);

export const parseStrictlyPositiveNumberValidation = (roundingUpMultiple: number) =>
  requiredInputValidation.and((str) => {
    const parsedValue = parseFloat(str);
    if (isNaN(parsedValue)) {
      return Err(`Invalid integer value: ${str}`);
    } else if (parsedValue <= 0) {
      return Err(`Should be strictly positive`);
    } else {
      return Ok(
        roundingUpMultiple !== undefined
          ? Math.ceil(parsedValue / roundingUpMultiple) * roundingUpMultiple
          : parsedValue
      );
    }
  });

export const runSummaryInitialRefreshCountValidation = parseStrictlyPositiveNumberValidation(1);
export const runSummaryRefreshIntervalValidation = parseStrictlyPositiveNumberValidation(5);
