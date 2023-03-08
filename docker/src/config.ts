import { Validator } from "idonttrustlikethat";

import { ApiClientConfig } from "@gatling-enterprise-runner/common/src/client/apiClient";
import {
  Config,
  RunConfig,
  requiredInputValidation,
  requiredBooleanValidation,
  uuidValidation,
  configKeysInputValidation,
  overrideLoadGeneratorsInputValidation
} from "@gatling-enterprise-runner/common/src/config";
import { Logger } from "@gatling-enterprise-runner/common/src/log";

export const readConfig = (logger: Logger): Config => {
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
  getValidatedInput(
    "GATLING_ENTERPRISE_URL",
    requiredInputValidation,
    "GATLING_ENTERPRISE_URL is required",
    "https://cloud.gatling.io"
  );

const getFailActionOnRunFailureConfig = (): boolean =>
  getValidatedInput(
    "FAIL_ACTION_ON_RUN_FAILURE",
    requiredBooleanValidation,
    "FAIL_ACTION_ON_RUN_FAILURE is required",
    "true"
  );

const getWaitForRunEnd = (): boolean =>
  getValidatedInput("WAIT_FOR_RUN_END", requiredBooleanValidation, "WAIT_FOR_RUN_END is required", "true");

const getApiConfig = (gatlingEnterpriseUrl: string): ApiClientConfig => {
  const apiToken = getValidatedInput(
    "GATLING_ENTERPRISE_API_TOKEN",
    requiredInputValidation,
    "GATLING_ENTERPRISE_API_TOKEN is required"
  );
  return {
    baseUrl: `${gatlingEnterpriseUrl}/api/public`,
    apiToken
  };
};

const getRunConfig = (): RunConfig => {
  const simulationId = getValidatedInput("SIMULATION_ID", uuidValidation, "SIMULATION_ID must be a valid UUID");
  const extraSystemProperties = getValidatedInput(
    "EXTRA_SYSTEM_PROPERTIES",
    configKeysInputValidation,
    "EXTRA_SYSTEM_PROPERTIES must be a JSON object and only contain string, number, and boolean values (or omitted entirely)"
  );
  const extraEnvironmentVariables = getValidatedInput(
    "EXTRA_ENVIRONMENT_VARIABLES",
    configKeysInputValidation,
    "EXTRA_ENVIRONMENT_VARIABLES must be a JSON object and only contain string, number, and boolean values (or omitted entirely)"
  );
  const overrideLoadGenerators = getValidatedInput(
    "OVERRIDE_LOAD_GENERATORS",
    overrideLoadGeneratorsInputValidation,
    "OVERRIDE_LOAD_GENERATORS must be a valid configuration for overriding load generators"
  );
  return {
    simulationId,
    extraSystemProperties,
    extraEnvironmentVariables,
    overrideLoadGenerators: overrideLoadGenerators
  };
};

const getValidatedInput = <T>(
  envVarName: string,
  validator: Validator<T>,
  errorMessage: string,
  defaultValue?: string
) => {
  const effectiveDefault = defaultValue ?? "";
  const rawInput = process.env[envVarName] ?? effectiveDefault;
  const result = validator.validate(rawInput);
  if (!result.ok) {
    // TODO RND-10 use validation error result to give better error messages
    throw new TypeError(errorMessage);
  }
  return result.value;
};
