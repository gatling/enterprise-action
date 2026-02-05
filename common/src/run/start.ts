import { ApiClient } from "../client/apiClient.js";
import { Config } from "../config.js";

export interface StartedRun {
  runId: string;
  reportsUrl: string;
  runsUrl: string;
}

export const startRun = async (client: ApiClient, config: Config): Promise<StartedRun> => {
  const response = await client.startSimulation(config.run.simulationId, {
    extraSystemProperties: config.run.extraSystemProperties,
    extraEnvironmentVariables: config.run.extraEnvironmentVariables,
    overrideHostsByPool: config.run.overrideLoadGenerators,
    title: config.run.title,
    description: config.run.description
  });

  // Fallback URLs for Gatling Enterprise Self-Hosted
  const reportsPath = response.reportsPath ?? `/simulations/reports/${response.runId}`;
  const runsPath = response.runsPath ?? `/simulations/runs/${config.run.simulationId}`;

  return {
    runId: response.runId,
    reportsUrl: webAppUrl(config, reportsPath),
    runsUrl: webAppUrl(config, runsPath)
  };
};

const webAppUrl = (config: Config, path: string): string => config.gatlingEnterpriseUrl + path;
