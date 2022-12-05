import { apiClient, ApiClientConfig } from "../../src/client/apiClient";
import nock from "nock";
import { expect, test } from "@jest/globals";
import { StartSimulationResponse } from "../../src/client/responses/startSimulationResponse";
import { HttpClientError } from "@actions/http-client";

const config: ApiClientConfig = {
  baseUrl: "https://cloud.gatling.io/api/public",
  apiToken: "my-token"
};
const client = apiClient(config);

const simulation_id = "3e5d7e20-53c2-40ba-b0a2-0b0d93b33287";
const simulation_start_expected_path = `/simulations/start?simulation=${simulation_id}`;

const successfulStartedSimulationResponse: StartSimulationResponse = {
  className: "computerdatabase.ComputerDatabaseSimulation",
  runId: "bd4e73bb-ac41-4786-ade6-6ce7f26e7fb2",
  reportsPath: "/o/demo-environment/simulations/reports/bd4e73bb-ac41-4786-ade6-6ce7f26e7fb2",
  runsPath: "/o/demo-environment/simulations/runs/3e5d7e20-53c2-40ba-b0a2-0b0d93b33287"
};

const unauthorizedResponse = {
  error: "invalid_request",
  error_description: "i.g.f.a.s.UnauthorizedException$: Access unauthorized"
};

test("startSimulation success", async () => {
  nock(config.baseUrl).post(simulation_start_expected_path).reply(200, successfulStartedSimulationResponse);

  const actualResponse = await client.startSimulation(simulation_id);
  expect(actualResponse).toStrictEqual(successfulStartedSimulationResponse);
});

test("startSimulation unauthorized error", async () => {
  nock(config.baseUrl).post(simulation_start_expected_path).reply(401, unauthorizedResponse);

  const request = client.startSimulation(simulation_id);
  await expect(request).rejects.toStrictEqual(
    new HttpClientError(
      '{"error":"invalid_request","error_description":"i.g.f.a.s.UnauthorizedException$: Access unauthorized"}',
      401
    )
  );
});

test("startSimulation not found error", async () => {
  nock(config.baseUrl).post(simulation_start_expected_path).reply(404);

  const request = client.startSimulation(simulation_id);
  await expect(request).rejects.toStrictEqual(new HttpClientError("Unexpected empty response", 404));
});
