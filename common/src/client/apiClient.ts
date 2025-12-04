import { HttpClient, HttpClientError, HttpCodes } from "@actions/http-client";
import { TypedResponse } from "@actions/http-client/lib/interfaces";
import { OutgoingHttpHeaders } from "http";

import { StartSimulationRequest } from "./requests/startSimulationRequest";
import { StartSimulationResponse } from "./responses/startSimulationResponse";
import { RunInformationResponse } from "./responses/runInformationResponse";
import { RequestsSummaryResponse } from "./responses/requestsSummaryResponse";
import { RunId } from "./models/runId";
import { PluginFlavor } from "./models/pluginFlavor";
import { ViewLiveResponse } from "./responses/liveInformationResponse";

export interface ApiClientConfig {
  baseUrl: string;
  apiToken: string;
  pluginFlavor: PluginFlavor;
  pluginVersion: string;
}

export interface ApiClient {
  startSimulation: (simulationId: string, options?: StartSimulationRequest) => Promise<StartSimulationResponse>;
  getLiveInformation: (runId: RunId) => Promise<ViewLiveResponse>;
  getRunInformation: (runId: string) => Promise<RunInformationResponse>;
  abortRun: (runId: string) => Promise<boolean>;
  getRequestsSummary: (runId: string) => Promise<RequestsSummaryResponse>;
}

export const apiClient = (conf: ApiClientConfig): ApiClient => {
  const client = new HttpClient();
  return {
    startSimulation: (simulationId, options) =>
      postJson(client, conf, "/api/public/simulations/start", options ?? {}, { simulation: simulationId }),
    getLiveInformation: (runId) =>
      getJson(client, conf, `/api/private/plugins/runs/${runId}/views/live`, {}, pluginHeaders(conf)),
    getRunInformation: (runId) => getJson(client, conf, "/api/public/run", { run: runId }),
    abortRun: (runId) => abortRun(client, conf, runId),
    getRequestsSummary: (runId) => getJson(client, conf, "/api/public/summaries/requests", { run: runId })
  };
};

const abortRun = async (client: HttpClient, conf: ApiClientConfig, runId: string): Promise<boolean> => {
  try {
    await postJson(client, conf, "/api/public/simulations/abort", {}, { run: runId });
    return true;
  } catch (error) {
    if (
      error instanceof HttpClientError &&
      (error.statusCode == HttpCodes.BadRequest || error.statusCode == HttpCodes.NotFound)
    ) {
      return false;
    } else {
      throw error;
    }
  }
};

const getJson = <T>(
  client: HttpClient,
  conf: ApiClientConfig,
  path: string,
  params?: Record<string, string>,
  additionalHeaders?: OutgoingHttpHeaders
): Promise<T> =>
  client.getJson<T>(buildUrl(conf, path, params), { ...headers(conf), ...additionalHeaders }).then(handleJsonResponse);

const postJson = <T>(
  client: HttpClient,
  conf: ApiClientConfig,
  path: string,
  payload: any,
  params?: Record<string, string>
): Promise<T> => client.postJson<T>(buildUrl(conf, path, params), payload, headers(conf)).then(handleJsonResponse);

const headers = (conf: ApiClientConfig): OutgoingHttpHeaders => ({
  ...baseHeaders,
  Authorization: conf.apiToken
});

const baseHeaders: OutgoingHttpHeaders = {
  "User-Agent": "GatlingEnterpriseGitHubAction/v1"
};

const pluginHeaders = (conf: ApiClientConfig): OutgoingHttpHeaders => ({
  "X-Gatling-Plugin-Flavor": conf.pluginFlavor,
  "X-Gatling-Plugin-Version": conf.pluginVersion
});

const buildUrl = (conf: ApiClientConfig, path: string, queryParams?: Record<string, string>): string => {
  const resourceUrl = conf.baseUrl + path;
  const url = new URL(resourceUrl);
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.append(key, value);
    }
  }
  return url.toString();
};

const handleJsonResponse = <T>(response: TypedResponse<T>): T => {
  if (response.statusCode === HttpCodes.NotFound || response.result === null) {
    throw new HttpClientError("Unexpected empty response", HttpCodes.NotFound);
  }
  return response.result;
};
