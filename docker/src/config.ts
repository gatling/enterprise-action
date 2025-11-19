import { Validator } from "idonttrustlikethat";

import { config, Logger, ApiClientConfig, PluginFlavor } from "@gatling-enterprise-runner/common";

export interface DockerConfig extends config.Config {
  outputDotEnvPath: string | undefined;
}

export const readConfig = (logger: Logger): DockerConfig => {
  const gatlingEnterpriseUrl = getGatlingEnterpriseUrlConfig();
  const apiUrl = getApiUrlConfig(gatlingEnterpriseUrl);
  const config = {
    gatlingEnterpriseUrl,
    api: getApiConfig(apiUrl),
    run: getRunConfig(),
    failActionOnRunFailure: getFailActionOnRunFailureConfig(),
    waitForRunEnd: getWaitForRunEnd(),
    runSummaryLoggingConfiguration: getRunSummaryLoggingConfiguration(),
    outputDotEnvPath: getOutputDotEnvPath()
  };
  logger.debug("Parsed configuration: " + JSON.stringify({ ...config, api: { ...config.api, apiToken: "*****" } }));
  return config;
};

const getGatlingEnterpriseUrlConfig = (): string =>
  getValidatedInput(
    "GATLING_ENTERPRISE_URL",
    config.requiredInputValidation,
    "GATLING_ENTERPRISE_URL is required",
    "https://cloud.gatling.io"
  );

const getApiUrlConfig = (gatlingEnterpriseUrl: string): string => {
  const configuredValue = getValidatedInput("GATLING_ENTERPRISE_API_URL", config.optionalInputValidation, "");
  return configuredValue !== undefined
    ? configuredValue
    : gatlingEnterpriseUrl === "https://cloud.gatling.io"
      ? "https://api.gatling.io"
      : gatlingEnterpriseUrl;
};

const getOutputDotEnvPath = (): string | undefined =>
  getValidatedInput("OUTPUT_DOT_ENV_FILE_PATH", config.optionalInputValidation, "");

const getFailActionOnRunFailureConfig = (): boolean =>
  getValidatedInput(
    "FAIL_ACTION_ON_RUN_FAILURE",
    config.requiredBooleanValidation,
    "FAIL_ACTION_ON_RUN_FAILURE is required",
    "true"
  );

const getWaitForRunEnd = (): boolean =>
  getValidatedInput("WAIT_FOR_RUN_END", config.requiredBooleanValidation, "WAIT_FOR_RUN_END is required", "true");

const getRunSummaryLoggingConfiguration = (): config.RunSummaryLoggingConfiguration => {
  const enabled = getValidatedInput(
    "RUN_SUMMARY_ENABLED",
    config.requiredBooleanValidation,
    "RUN_SUMMARY_ENABLED is required",
    "true"
  );
  const getIntervalInput = (name: string, validator: Validator<number>, defaultValue: string) =>
    getValidatedInput(name, validator, `${name} must be a positive number`, defaultValue);
  const initialRefreshInterval = getIntervalInput(
    "RUN_SUMMARY_INITIAL_REFRESH_INTERVAL",
    config.runSummaryRefreshIntervalValidation,
    "5"
  );
  const initialRefreshCount = getIntervalInput(
    "RUN_SUMMARY_INITIAL_REFRESH_COUNT",
    config.runSummaryInitialRefreshCountValidation,
    "12"
  );
  const refreshInterval = getIntervalInput(
    "RUN_SUMMARY_REFRESH_INTERVAL",
    config.runSummaryRefreshIntervalValidation,
    "60"
  );
  return { enabled, initialRefreshInterval, initialRefreshCount, refreshInterval };
};

const getApiConfig = (apiUrl: string): ApiClientConfig => {
  const apiToken = getValidatedInput(
    "GATLING_ENTERPRISE_API_TOKEN",
    config.requiredInputValidation,
    "GATLING_ENTERPRISE_API_TOKEN is required"
  );
  return {
    baseUrl: apiUrl,
    apiToken: apiToken,
    pluginFlavor: PluginFlavor.ENTERPRISE_RUNNER,
    pluginVersion: require("package.json").version
  };
};

const getRunConfig = (): config.RunConfig => {
  const simulationId = getValidatedInput(
    "SIMULATION_ID",
    config.requiredInputValidation,
    "SIMULATION_ID must be a non-empty string"
  );
  const extraSystemProperties = getValidatedInput(
    "EXTRA_SYSTEM_PROPERTIES",
    config.configKeysInputValidation,
    "EXTRA_SYSTEM_PROPERTIES must be a JSON object and only contain string, number, and boolean values (or omitted entirely)"
  );
  const extraEnvironmentVariables = getValidatedInput(
    "EXTRA_ENVIRONMENT_VARIABLES",
    config.configKeysInputValidation,
    "EXTRA_ENVIRONMENT_VARIABLES must be a JSON object and only contain string, number, and boolean values (or omitted entirely)"
  );
  const overrideLoadGenerators = getValidatedInput(
    "OVERRIDE_LOAD_GENERATORS",
    config.overrideLoadGeneratorsInputValidation,
    "OVERRIDE_LOAD_GENERATORS must be a valid configuration for overriding load generators"
  );
  const title = getValidatedInput(
    "TITLE",
    config.optionalInputValidation,
    "TITLE must be a string (or omitted entirely)"
  );
  const description = getValidatedInput(
    "DESCRIPTION",
    config.optionalInputValidation,
    "DESCRIPTION must be a string (or omitted entirely)"
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

const getValidatedInput = <T>(
  envVarName: string,
  validator: Validator<T>,
  errorMessage: string,
  defaultValue?: string
) => {
  const effectiveDefault = defaultValue ?? "";

  // The PLUGIN_ prefix is used to pass env values to Harness
  const rawInput = process.env[envVarName] ?? process.env[`PLUGIN_${envVarName}`] ?? effectiveDefault;
  const result = validator.validate(rawInput);
  if (!result.ok) {
    // TODO RND-10 use validation error result to give better error messages
    throw new TypeError(errorMessage);
  }
  return result.value;
};
