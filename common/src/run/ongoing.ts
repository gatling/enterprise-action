import { setTimeout } from "timers/promises";

import { ApiClient } from "../client/apiClient";
import { Assertion, RunInformationResponse } from "../client/responses/runInformationResponse";
import { Logger } from "../log";
import { getAndLogMetricsSummary } from "../run/metrics";
import { StartedRun } from "../run/start";
import { isRunning, statusName } from "../run/status";
import { formatErrorMessage, console } from "../utils";
import { Config } from "../config";

export interface FinishedRun {
  runId: String;
  statusCode: number;
  statusName: string;
  assertions: Assertion[];
}

const MAX_CONSECUTIVE_ERRORS = 5;

export const waitForRunEnd = async (
  client: ApiClient,
  config: Config,
  logger: Logger,
  startedRun: StartedRun
): Promise<FinishedRun> => {
  let runInfo: RunInformationResponse | undefined;
  let oldStatus: number = -1;
  let consecutiveErrorsCount = 0;

  const refreshConstantMillis = config.runSummaryRefreshDelay.constant * 1000;
  const refreshMaxMillis = config.runSummaryRefreshDelay.max * 1000;
  let lastSummaryDisplayMillis = hrtimeMillis();
  let refreshPower = -1;
  let refreshIntervalMillis: number | undefined;

  do {
    try {
      await setTimeout(5000); // Initial delay even on first iteration because run duration might not be populated yet
      runInfo = await client.getRunInformation(startedRun.runId);
      const statusMsg = `Run status is now ${statusName(runInfo.status)} [${runInfo.status}]`;
      runInfo.status !== oldStatus ? logger.log(statusMsg) : logger.debug(statusMsg);
      oldStatus = runInfo.status;

      if (config.runSummaryRefreshDelay.enable && runInfo.injectStart > 0) {
        const refreshCurrentTime = hrtimeMillis();
        if (!refreshIntervalMillis || refreshCurrentTime - lastSummaryDisplayMillis >= refreshIntervalMillis) {
          refreshPower++;
          refreshIntervalMillis = Math.min(
            refreshConstantMillis * Math.pow(config.runSummaryRefreshDelay.base, refreshPower),
            refreshMaxMillis
          );
          const displayedRefreshInterval = Math.ceil(refreshIntervalMillis / 5000) * 5000; // Round up to nearest 5 seconds as it's our max resolution
          await getAndLogMetricsSummary(client, logger, runInfo, displayedRefreshInterval);
          lastSummaryDisplayMillis = refreshCurrentTime;
        }
      }
      consecutiveErrorsCount = 0;
    } catch (error) {
      consecutiveErrorsCount++;
      handleError(logger, error, consecutiveErrorsCount);
    }
  } while (runInfo === undefined || isRunning(runInfo.status));
  return {
    runId: runInfo.runId,
    statusCode: runInfo.status,
    statusName: statusName(runInfo.status),
    assertions: runInfo.assertions
  };
};

/**
 * Current time in milliseconds. Start time is arbitrary, but value should not be subject to system clock drift.
 * See https://nodejs.org/api/process.html#processhrtimetime.
 */
const hrtimeMillis = (): number => Number(process.hrtime.bigint() / 1_000_000n);

const handleError = (logger: Logger, error: any, errorCount: number) => {
  if (errorCount < MAX_CONSECUTIVE_ERRORS) {
    const msg = formatErrorMessage(error);
    logger.log(
      console.yellow(
        `Failed to retrieve current run information (attempt ${errorCount}/${MAX_CONSECUTIVE_ERRORS}): ${msg}`
      )
    );
  } else {
    throw error;
  }
};
