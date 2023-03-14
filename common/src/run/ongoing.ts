import { setTimeout } from "timers/promises";

import { ApiClient } from "../client/apiClient";
import { Assertion, RunInformationResponse } from "../client/responses/runInformationResponse";
import { Logger } from "../log";
import { getAndLogMetricsSummary } from "../run/metrics";
import { StartedRun } from "../run/start";
import { isRunning, statusName } from "../run/status";
import { formatErrorMessage, console } from "../utils";

export interface FinishedRun {
  runId: String;
  statusCode: number;
  statusName: string;
  assertions: Assertion[];
}

const MAX_CONSECUTIVE_ERRORS = 5;

export const waitForRunEnd = async (
  client: ApiClient,
  logger: Logger,
  startedRun: StartedRun
): Promise<FinishedRun> => {
  let runInfo: RunInformationResponse | undefined;
  let oldStatus: number = -1;
  let consecutiveErrorsCount = 0;
  do {
    try {
      await setTimeout(5000); // Initial delay even on first iteration because run duration might not be populated yet
      runInfo = await client.getRunInformation(startedRun.runId);
      const statusMsg = `Run status is now ${statusName(runInfo.status)} [${runInfo.status}]`;
      runInfo.status !== oldStatus ? logger.log(statusMsg) : logger.debug(statusMsg);
      oldStatus = runInfo.status;
      if (runInfo.injectStart > 0) {
        await getAndLogMetricsSummary(client, logger, runInfo);
      }
      consecutiveErrorsCount = 0;
    } catch (error) {
      consecutiveErrorsCount++;
      if (consecutiveErrorsCount < MAX_CONSECUTIVE_ERRORS) {
        const msg = formatErrorMessage(error);
        logger.log(
          console.yellow(
            `Failed to retrieve current run information (attempt ${consecutiveErrorsCount}/${MAX_CONSECUTIVE_ERRORS}): ${msg}`
          )
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
