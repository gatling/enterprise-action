import { HttpClient, HttpClientError, HttpCodes } from "@actions/http-client";
import { TypedResponse } from "@actions/http-client/lib/interfaces";
import { OutgoingHttpHeaders } from "http";

import { StartSimulationRequest } from "./requests/startSimulationRequest";
import { StartSimulationResponse } from "./responses/startSimulationResponse";
import { RunInformationResponse } from "./responses/runInformationResponse";
import { SimulationResponse } from "./responses/simulationResponse";
import { SeriesResponse } from "./responses/seriesResponse";
import { RequestsSummaryResponse } from "./responses/requestsSummaryResponse";

export interface ApiClientConfig {
  baseUrl: string;
  apiToken: string;
}

export interface ApiClient {
  startSimulation: (simulationId: string, options?: StartSimulationRequest) => Promise<StartSimulationResponse>;
  getRunInformation: (runId: string) => Promise<RunInformationResponse>;
  getSimulations: () => Promise<SimulationResponse[]>;
  abortRun: (runId: string) => Promise<boolean>;
  getConcurrentUserMetric: (runId: string, scenario: string) => Promise<SeriesResponse[]>;
  getRequestsSummary: (runId: string) => Promise<RequestsSummaryResponse>;
  checkCloudCompatibility: () => Promise<void>;
}

export const apiClient = (conf: ApiClientConfig): ApiClient => {
  const client = new HttpClient();
  return {
    startSimulation: (simulationId, options) =>
      postJson(client, conf, "/simulations/start", options ?? {}, { simulation: simulationId }),
    getRunInformation: (runId) => getJson(client, conf, "/run", { run: runId }),
    getSimulations: () => getJson(client, conf, "/simulations"),
    abortRun: (runId) => abortRun(client, conf, runId),
    getConcurrentUserMetric: (runId, scenario) => getJson(client, conf, "/series", seriesParams(runId, scenario)),
    getRequestsSummary: (runId) => getJson(client, conf, "/summaries/requests", { run: runId }),
    checkCloudCompatibility: () => checkCloudCompatibility(client, conf)
  };
};

const seriesParams = (runId: string, scenario: string) => ({
  run: runId,
  scenario: scenario,
  group: "",
  request: "",
  node: "",
  remote: "",
  metric: "usrActive"
});

const abortRun = async (client: HttpClient, conf: ApiClientConfig, runId: string): Promise<boolean> => {
  try {
    await postJson(client, conf, "/simulations/abort", {}, { run: runId });
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

const checkCloudCompatibility = async (client: HttpClient, conf: ApiClientConfig): Promise<void> => {
  const clientName = "gatling-enterprise-github-action";
  const version = "0.0.1";
  const response = await client.get(buildUrl(conf, "/compatibility", { clientName, version }), baseHeaders);
  if (response.message.statusCode === HttpCodes.BadRequest) {
    throw new Error(
      `Plugin ${clientName} version ${version} is no longer supported; please upgrade to the latest version`
    );
  }
};

const getJson = <T>(
  client: HttpClient,
  conf: ApiClientConfig,
  path: string,
  params?: Record<string, string>
): Promise<T> => client.getJson<T>(buildUrl(conf, path, params), headers(conf)).then(handleJsonResponse);

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

const baseHeaders: OutgoingHttpHeaders = { "User-Agent": "GatlingEnterpriseGitHubAction/v1" };

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
