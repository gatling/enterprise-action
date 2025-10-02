import * as core from "@actions/core";
import { Validator } from "idonttrustlikethat";

import { ApiClientConfig, config, Logger, PluginFlavor } from "@gatling-enterprise-runner/common";

export const readConfig = (logger: Logger): config.Config => {
  const gatlingEnterpriseUrl = getGatlingEnterpriseUrlConfig();
  const apiUrl = getApiUrlConfig(gatlingEnterpriseUrl);
  const config = {
    gatlingEnterpriseUrl,
    api: getApiConfig(apiUrl),
    run: getRunConfig(),
    failActionOnRunFailure: getFailActionOnRunFailureConfig(),
    waitForRunEnd: getWaitForRunEnd(),
    runSummaryLoggingConfiguration: getRunSummaryLoggingConfiguration()
  };
  logger.debug("Parsed configuration: " + JSON.stringify({ ...config, api: { ...config.api, apiToken: "*****" } }));
  return config;
};

const getGatlingEnterpriseUrlConfig = (): string =>
  getValidatedInput("gatling_enterprise_url", config.requiredInputValidation, "gatling_enterprise_url is required");

const getApiUrlConfig = (gatlingEnterpriseUrl: string): string => {
  const configuredValue = getValidatedInput("gatling_enterprise_api_url", config.optionalInputValidation, "");
  return configuredValue !== undefined
    ? configuredValue
    : gatlingEnterpriseUrl === "https://cloud.gatling.io"
      ? "https://api.gatling.io"
      : gatlingEnterpriseUrl;
};

const getFailActionOnRunFailureConfig = (): boolean =>
  getValidatedInput(
    "fail_action_on_run_failure",
    config.requiredBooleanValidation,
    "fail_action_on_run_failure is required"
  );

const getWaitForRunEnd = (): boolean =>
  getValidatedInput("wait_for_run_end", config.requiredBooleanValidation, "wait_for_run_end is required");

const getRunSummaryLoggingConfiguration = (): config.RunSummaryLoggingConfiguration => {
  const enabled = getValidatedInput(
    "run_summary_enabled",
    config.requiredBooleanValidation,
    "run_summary_enabled is required"
  );
  const getIntervalInput = (name: string, validator: Validator<number>) =>
    getValidatedInput(name, validator, `${name} must be a positive number`);
  const initialRefreshInterval = getIntervalInput(
    "run_summary_initial_refresh_interval",
    config.runSummaryRefreshIntervalValidation
  );
  const initialRefreshCount = getIntervalInput(
    "run_summary_initial_refresh_count",
    config.runSummaryInitialRefreshCountValidation
  );
  const refreshInterval = getIntervalInput("run_summary_refresh_interval", config.runSummaryRefreshIntervalValidation);
  return { enabled, initialRefreshInterval, initialRefreshCount, refreshInterval };
};

const getApiConfig = (apiUrl: string): ApiClientConfig => {
  const apiToken = getValidatedInput(
    "api_token",
    config.requiredInputValidation,
    "api_token is required",
    "GATLING_ENTERPRISE_API_TOKEN"
  );

  return {
    baseUrl: apiUrl,
    apiToken: apiToken,
    pluginFlavor: PluginFlavor.GITHUB_ACTION,
    pluginVersion: require("package.json").version
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
  const title = getValidatedInput(
    "title",
    config.optionalInputValidation,
    "title must be a string (or omitted entirely)"
  );
  const description = getValidatedInput(
    "description",
    config.optionalInputValidation,
    "description must be a string (or omitted entirely)"
  );
  return {
    simulationId,
    extraSystemProperties,
    extraEnvironmentVariables,
    overrideLoadGenerators,
    title,
    description
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
