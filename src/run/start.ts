import { ApiClient } from "../client/apiClient";
import { ActionConfig } from "../config";

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

  const reportsUrl = webAppUrl(config, response.reportsPath);
  const runsUrl = webAppUrl(config, response.runsPath);
  return { runId: response.runId, reportsUrl, runsUrl };
};

const webAppUrl = (config: ActionConfig, path?: string): string | undefined =>
  path ? config.gatlingEnterpriseUrl + path : undefined;
