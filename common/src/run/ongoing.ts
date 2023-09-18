import { setInterval } from "timers/promises";

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
const REFRESH_DELAY_MILLIS = 5000;

export const waitForRunEnd = async (
  client: ApiClient,
  config: Config,
  logger: Logger,
  startedRun: StartedRun
): Promise<FinishedRun> => {
  const cancelInterval = new AbortController();
  const intervalIterator = setInterval(REFRESH_DELAY_MILLIS, undefined, { signal: cancelInterval.signal })[
    Symbol.asyncIterator
  ]();
  try {
    return await waitForRunEndLoop(intervalIterator, client, config, logger, startedRun);
  } finally {
    cancelInterval.abort();
  }
};

const waitForRunEndLoop = async (
  intervalIterator: AsyncIterator<unknown>,
  client: ApiClient,
  config: Config,
  logger: Logger,
  startedRun: StartedRun
): Promise<FinishedRun> => {
  let runInfo: RunInformationResponse | undefined;
  let oldStatus: number = -1;
  let consecutiveErrorsCount = 0;

  const summaryEnabled = config.runSummaryLoggingConfiguration.enabled;
  const initialIntervalMillis = config.runSummaryLoggingConfiguration.initialRefreshInterval * 1000;
  const initialIntervalCount = config.runSummaryLoggingConfiguration.initialRefreshCount;
  const intervalMillis = config.runSummaryLoggingConfiguration.refreshInterval * 1000;

  let refreshIntervalMillis = initialIntervalMillis;
  let lastSummaryDisplayMillis = -1;
  let iterationsSinceRunStart = 0;
  let currentSummaryNo = 0;

  do {
    try {
      await intervalIterator.next(); // Initial delay even on first iteration because run duration might not be populated yet

      runInfo = await client.getRunInformation(startedRun.runId);
      const statusMsg = `Run status is now ${statusName(runInfo.status)} [${runInfo.status}]`;
      runInfo.status !== oldStatus ? logger.log(statusMsg) : logger.debug(statusMsg);
      oldStatus = runInfo.status;

      if (summaryEnabled && runInfo.injectStart > 0) {
        iterationsSinceRunStart++;
        const elapsedTimeMillis = iterationsSinceRunStart * REFRESH_DELAY_MILLIS;
        logger.debug(`elapsedTimeMillis=${elapsedTimeMillis}`);
        logger.debug(`lastSummaryDisplayMillis=${lastSummaryDisplayMillis}`);
        logger.debug(`refreshIntervalMillis=${refreshIntervalMillis}`);
        if (elapsedTimeMillis - lastSummaryDisplayMillis >= refreshIntervalMillis) {
          currentSummaryNo++;
          if (currentSummaryNo >= initialIntervalCount) {
            refreshIntervalMillis = intervalMillis;
          }
          const displayedRefreshInterval =
            Math.ceil(refreshIntervalMillis / REFRESH_DELAY_MILLIS) * REFRESH_DELAY_MILLIS; // Round up to nearest 5 seconds as it's our max resolution
          await getAndLogMetricsSummary(client, logger, runInfo, elapsedTimeMillis, displayedRefreshInterval);
          lastSummaryDisplayMillis = elapsedTimeMillis;
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
