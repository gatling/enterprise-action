import * as core from "@actions/core";
import { Validator } from "idonttrustlikethat";

import { ApiClientConfig, config, Logger } from "@gatling-enterprise-runner/common";

export const readConfig = (logger: Logger): config.Config => {
  const gatlingEnterpriseUrl = getGatlingEnterpriseUrlConfig();
  const config = {
    gatlingEnterpriseUrl,
    api: getApiConfig(gatlingEnterpriseUrl),
    run: getRunConfig(),
    failActionOnRunFailure: getFailActionOnRunFailureConfig(),
    waitForRunEnd: getWaitForRunEnd()
  };
  logger.debug(
    "Parsed configuration: " + JSON.stringify({ api: { ...config.api, apiToken: "*****" }, run: config.run })
  );
  return config;
};

const getGatlingEnterpriseUrlConfig = (): string =>
  getValidatedInput("gatling_enterprise_url", config.requiredInputValidation, "gatling_enterprise_url is required");

const getFailActionOnRunFailureConfig = (): boolean =>
  getValidatedInput(
    "fail_action_on_run_failure",
    config.requiredBooleanValidation,
    "fail_action_on_run_failure is required"
  );

const getWaitForRunEnd = (): boolean =>
  getValidatedInput("wait_for_run_end", config.requiredBooleanValidation, "wait_for_run_end is required");

const getApiConfig = (gatlingEnterpriseUrl: string): ApiClientConfig => {
  const apiToken = getValidatedInput(
    "api_token",
    config.requiredInputValidation,
    "api_token is required",
    "GATLING_ENTERPRISE_API_TOKEN"
  );
  return {
    baseUrl: `${gatlingEnterpriseUrl}/api/public`,
    apiToken
  };
};

const getRunConfig = (): config.RunConfig => {
  const simulationId = getValidatedInput("simulation_id", config.uuidValidation, "simulation_id must be a valid UUID");
  const extraSystemProperties = getValidatedInput(
    "extra_system_properties",
    config.configKeysInputValidation,
    "extra_system_properties must be a JSON object and only contain string, number, and boolean values (or omitted entirely)"
  );
  const extraEnvironmentVariables = getValidatedInput(
    "extra_environment_variables",
    config.configKeysInputValidation,
    "extra_environment_variables must be a JSON object and only contain string, number, and boolean values (or omitted entirely)"
  );
  const overrideLoadGenerators = getValidatedInput(
    "override_load_generators",
    config.overrideLoadGeneratorsInputValidation,
    "override_load_generators must be a valid configuration for overriding load generators"
  );
  return {
    simulationId,
    extraSystemProperties,
    extraEnvironmentVariables,
    overrideLoadGenerators: overrideLoadGenerators
  };
};

const getValidatedInput = <T>(name: string, validator: Validator<T>, errorMessage: string, envVarName?: string) => {
  const rawInput = core.getInput(name);
  const inputWithFallback = rawInput === "" && envVarName ? getEnvVar(envVarName) : rawInput;
  const result = validator.validate(inputWithFallback);
  if (!result.ok) {
    // TODO RND-10 use validation error result to give better error messages
    throw new TypeError(errorMessage);
  }
  return result.value;
};

/**
 * Returns an empty string if not found, to stay consistent with how GH Actions handles empty input values.
 */
const getEnvVar = (envVarName: string): string => process.env[envVarName] ?? "";