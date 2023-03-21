import { ApiClientConfig } from "./client/apiClient";
import { boolean, dictionary, Err, number, object, Ok, Result, string, union } from "idonttrustlikethat";

export interface Config {
  gatlingEnterpriseUrl: string;
  api: ApiClientConfig;
  run: RunConfig;
  failActionOnRunFailure: boolean;
  waitForRunEnd: boolean;
}

export interface RunConfig {
  simulationId: string;
  extraSystemProperties?: Record<string, string>;
  extraEnvironmentVariables?: Record<string, string>;
  overrideLoadGenerators?: Record<string, LoadGeneratorConfiguration>;
}

export interface LoadGeneratorConfiguration {
  size: number;
  weight?: number;
}

export const requiredInputValidation = string.filter((str) => str !== "");
const optionalInputValidation = string.map((str) => (str === "" ? undefined : str));
export const requiredBooleanValidation = requiredInputValidation.and((str) => {
  const lowerCaseStr = str.toLowerCase();
  return lowerCaseStr === "true"
    ? Ok(true)
    : lowerCaseStr === "false"
    ? Ok(false)
    : Err(`Invalid boolean value: ${str}`);
});
export const uuidValidation = string.filter((str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
);
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
  dictionary(uuidValidation, object({ size: number, weight: number.optional() }))
);
export const overrideLoadGeneratorsInputValidation = optionalInputValidation.then(
  overrideLoadGeneratorsValidation.optional()
);
