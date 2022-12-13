import { ApiClient } from "../client/apiClient";
import { StartedRun } from "./start";
import { Assertion, RunInformationResponse } from "../client/responses/runInformationResponse";
import { setTimeout } from "timers/promises";
import * as core from "@actions/core";
import { isRunning, statusName } from "./status";
import { getAndLogMetricsSummary } from "./metrics";
import { formatErrorMessage } from "../utils/error";

export interface FinishedRun {
  runId: String;
  statusCode: number;
  statusName: string;
  assertions: Assertion[];
}

const MAX_CONSECUTIVE_ERRORS = 5;

export const waitForRunEnd = async (client: ApiClient, startedRun: StartedRun): Promise<FinishedRun> => {
  let runInfo: RunInformationResponse | undefined;
  let oldStatus: number = -1;
  let errorCount = 0;
  do {
    try {
      await setTimeout(5000); // Initial delay even on first iteration because run duration might not be populated yet
      runInfo = await client.getRunInformation(startedRun.runId);
      const statusMsg = `Run status is now ${statusName(runInfo.status)} [${runInfo.status}]`;
      runInfo.status !== oldStatus ? core.info(statusMsg) : core.debug(statusMsg);
      oldStatus = runInfo.status;
      if (runInfo.injectStart > 0) {
        await getAndLogMetricsSummary(client, runInfo);
      }
    } catch (error) {
      errorCount++;
      if (errorCount < MAX_CONSECUTIVE_ERRORS) {
        const msg = formatErrorMessage(error);
        core.warning(
          `Failed to retrieve current run information (attempt ${errorCount}/${MAX_CONSECUTIVE_ERRORS}): ${msg}`
        );
      } else {
        throw error;
      }
    }
  } while (runInfo === undefined || isRunning(runInfo.status));
  return {
    runId: runInfo.runId,
    statusCode: runInfo.status,
    statusName: statusName(runInfo.status),
    assertions: runInfo.assertions
  };
};
