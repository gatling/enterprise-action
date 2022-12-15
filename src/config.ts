import * as core from "@actions/core";
import { ApiClientConfig } from "./client/apiClient";
import { string, dictionary, object, number, Validator, Ok, Err, Result } from "idonttrustlikethat";
import { logDebug } from "./utils/log";

export interface ActionConfig {
  gatlingEnterpriseUrl: string;
  api: ApiClientConfig;
  run: RunConfig;
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

export const readConfig = (): ActionConfig => {
  const gatlingEnterpriseUrl = getGatlingEnterpriseUrlConfig();
  const config = { gatlingEnterpriseUrl, api: getApiConfig(gatlingEnterpriseUrl), run: getRunConfig() };
  logDebug("Parsed configuration: " + JSON.stringify({ api: { ...config.api, apiToken: "*****" }, run: config.run }));
  return config;
};

const getGatlingEnterpriseUrlConfig = (): string =>
  getValidatedInput("gatling_enterprise_url", requiredInputValidation, "gatling_enterprise_url is required");

const getApiConfig = (gatlingEnterpriseUrl: string): ApiClientConfig => {
  const apiToken = getValidatedInput("api_token", requiredInputValidation, "api_token is required");
  return {
    baseUrl: `${gatlingEnterpriseUrl}/api/public`,
    apiToken
  };
};

const getRunConfig = (): RunConfig => {
  const simulationId = getValidatedInput("simulation_id", uuidValidation, "simulation_id must be a valid UUID");
  const extraSystemProperties = getValidatedInput(
    "extra_system_properties",
    configKeysInputValidation,
    "extra_system_properties must be a JSON object and only contain string values (or omitted entirely)"
  );
  const extraEnvironmentVariables = getValidatedInput(
    "extra_environment_variables",
    configKeysInputValidation,
    "extra_environment_variables must be a JSON object and only contain string values (or omitted entirely)"
  );
  const overrideLoadGenerators = getValidatedInput(
    "override_load_generators",
    overrideLoadGeneratorsInputValidation,
    "override_load_generators must be a valid configuration for overriding load generators"
  );
  return {
    simulationId,
    extraSystemProperties,
    extraEnvironmentVariables,
    overrideLoadGenerators: overrideLoadGenerators
  };
};

const requiredInputValidation = string.filter((str) => str !== "");
const optionalInputValidation = string.map((str) => (str === "" ? undefined : str));
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
const configKeysValidation = jsonValidation.then(dictionary(string, string));
export const configKeysInputValidation = optionalInputValidation.then(configKeysValidation.optional());
const overrideLoadGeneratorsValidation = jsonValidation.then(
  dictionary(uuidValidation, object({ size: number, weight: number.optional() }))
);
export const overrideLoadGeneratorsInputValidation = optionalInputValidation.then(
  overrideLoadGeneratorsValidation.optional()
);

const getValidatedInput = <T>(name: string, validator: Validator<T>, errorMessage: string) => {
  const rawInput = core.getInput(name);
  const result = validator.validate(rawInput);
  if (!result.ok) {
    // TODO RND-10 use validation error result to give better error messages
    throw new TypeError(errorMessage);
  }
  return result.value;
};
