import { ApiClient } from "../client/apiClient.js";
import { Config } from "../config.js";

export interface StartedRun {
  runId: string;
  reportsUrl: string;
}

export const startRun = async (client: ApiClient, config: Config): Promise<StartedRun> => {
  const response = await client.startSimulation(config.run.simulationId, {
    title: config.run.title,
    description: config.run.description,
    extra: {
      systemProperties: config.run.extraSystemProperties,
      environmentVariables: config.run.extraEnvironmentVariables
    }
  });

  return {
    runId: response.data._id,
    reportsUrl: webAppUrl(config, response.metadata.urls.run)
  };
};

const webAppUrl = (config: Config, urlOrPath: string): string => {
  const path = extractPath(urlOrPath);
  return config.gatlingEnterpriseUrl + path;
};

const extractPath = (urlOrPath: string): string => {
  try {
    const url = new URL(urlOrPath);
    return url.pathname + url.search;
  } catch {
    return urlOrPath;
  }
};
