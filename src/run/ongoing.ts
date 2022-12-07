import { ApiClient } from "../client/apiClient";
import { StartedRun } from "./start";
import { Assertion, RunInformationResponse } from "../client/responses/runInformationResponse";
import { setTimeout } from "timers/promises";
import * as core from "@actions/core";
import { isRunning, statusName } from "./status";

export interface FinishedRun {
  runId: String;
  statusCode: number;
  statusName: string;
  assertions: Assertion[];
}

export const waitForRunEnd = async (client: ApiClient, startedRun: StartedRun): Promise<FinishedRun> => {
  let runInfo: RunInformationResponse;
  let oldStatus: number = -1;
  do {
    await setTimeout(5000); // Initial delay even on first iteration because run duration might not be populated yet
    runInfo = await client.getRunInformation(startedRun.runId);
    const statusMsg = `Run status is now ${statusName(runInfo.status)} [${runInfo.status}]`;
    runInfo.status !== oldStatus ? core.info(statusMsg) : core.debug(statusMsg);
    oldStatus = runInfo.status;
  } while (isRunning(runInfo.status));
  return {
    runId: runInfo.runId,
    statusCode: runInfo.status,
    statusName: statusName(runInfo.status),
    assertions: runInfo.assertions
  };
};
