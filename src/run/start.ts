import { ApiClient } from "../client/apiClient";
import { ActionConfig } from "../config";
import { logInfo } from "../utils/log";

export interface StartedRun {
  runId: string;
  reportsUrl?: string;
  runsUrl?: string;
}

export const startRun = async (client: ApiClient, config: ActionConfig): Promise<StartedRun> => {
  const response = await client.startSimulation(config.run.simulationId, {
    extraSystemProperties: config.run.extraSystemProperties,
    extraEnvironmentVariables: config.run.extraEnvironmentVariables,
    overrideHostsByPool: config.run.overrideLoadGenerators
  });
  logInfo(`Started run ${response.runId} for simulation ${config.run.simulationId}`);
  const reportsUrl = webAppUrl(config, response.reportsPath);
  if (reportsUrl) {
    logInfo(`Reports will be available at ${reportsUrl}`);
  }
  const runsUrl = webAppUrl(config, response.runsPath);
  if (runsUrl) {
    logInfo(`Runs history is available at ${runsUrl}`);
  }
  return { runId: response.runId, reportsUrl, runsUrl };
};

const webAppUrl = (config: ActionConfig, path?: string): string | undefined =>
  path ? config.gatlingEnterpriseUrl + path : undefined;
