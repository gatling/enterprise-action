import * as http from "@actions/http-client";
import { StartSimulationRequest } from "./requests/startSimulationRequest";
import { StartSimulationResponse } from "./responses/startSimulationResponse";
import { TypedResponse } from "@actions/http-client/lib/interfaces";
import { HttpClientError, HttpCodes } from "@actions/http-client";
import { RunInformationResponse } from "./responses/runInformationResponse";
import { SimulationResponse } from "./responses/simulationResponse";
import { SeriesResponse } from "./responses/seriesResponse";
import { RequestsSummaryResponse } from "./responses/requestsSummaryResponse";
import { OutgoingHttpHeaders } from "http";

export interface ApiClient {
  startSimulation: (simulationId: string, options?: StartSimulationRequest) => Promise<StartSimulationResponse>;
  getRunInformation: (runId: string) => Promise<RunInformationResponse>;
  getSimulations: () => Promise<SimulationResponse[]>;
  abortRun: (runId: string) => Promise<void>;
  getUserConcurrentMetric: (runId: string, scenario: string) => Promise<SeriesResponse[]>;
  getRequestsSummary: (runId: string) => Promise<RequestsSummaryResponse>;
}

export const apiClient = (): ApiClient => {
  const client = new http.HttpClient();
  const conf: HttpConf = {
    // TODO RND-5 configurable
    baseUrl: "https://cloud.gatling.io/api/public",
    apiToken: ""
  };
  return {
    startSimulation: (simulationId, options) =>
      postJson(client, conf, "/simulations/start", options ?? {}, { simulation: simulationId }),
    getRunInformation: (runId) => getJson(client, conf, "/run", { run: runId }),
    getSimulations: () => getJson(client, conf, "/simulations"),
    abortRun: (runId) => postJson(client, conf, "/simulations/abort", {}, { run: runId }),
    getUserConcurrentMetric: (runId, scenario) => getJson(client, conf, "/series", seriesParams(runId, scenario)),
    getRequestsSummary: (runId) => getJson(client, conf, "/summaries/requests", { run: runId })
  };
};

interface HttpConf {
  baseUrl: string;
  apiToken: string;
}

const seriesParams = (runId: string, scenario: string) => ({
  run: runId,
  scenario: scenario,
  group: "",
  request: "",
  node: "",
  remote: "",
  metric: "usrActive"
});

const getJson = async <T>(
  client: http.HttpClient,
  conf: HttpConf,
  path: string,
  params?: Record<string, string>
): Promise<T> => client.getJson<T>(buildUrl(conf, path, params), headers(conf)).then(handleJsonResponse);

const postJson = async <T>(
  client: http.HttpClient,
  conf: HttpConf,
  path: string,
  payload: any,
  params?: Record<string, string>
): Promise<T> => client.postJson<T>(buildUrl(conf, path, params), payload, headers(conf)).then(handleJsonResponse);

const headers = (conf: HttpConf): OutgoingHttpHeaders => ({ Authorization: conf.apiToken });

const buildUrl = (conf: HttpConf, path: string, queryParams?: Record<string, string>): string => {
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
