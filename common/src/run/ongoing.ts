import { setInterval } from "timers/promises";

import { ApiClient } from "../client/apiClient.js";
import { Assertion } from "../client/responses/runInformationResponse.js";
import { Logger } from "../log.js";
import { logViewLiveStatistics } from "../run/metrics.js";
import { StartedRun } from "../run/start.js";
import { formatErrorMessage, console } from "../utils/index.js";
import { Config } from "../config.js";
import { RunStatus, RunStatusDisplayNames, RunStatusHelpers } from "../client/models/runStatus.js";
import { ViewLiveResponse } from "../client/responses/liveInformationResponse.js";

export interface FinishedRun {
  runId: String;
  status: RunStatus;
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
  let viewLiveResponse: ViewLiveResponse | undefined;
  let oldStatus: RunStatus | undefined;
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

      viewLiveResponse = await client.getLiveInformation(startedRun.runId);
      const statusMsg = `Run status is now ${RunStatusDisplayNames[viewLiveResponse.status]}`;
      viewLiveResponse.status !== oldStatus ? logger.log(statusMsg) : logger.debug(statusMsg);
      oldStatus = viewLiveResponse.status;

      if (summaryEnabled && viewLiveResponse.statistics) {
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

          logViewLiveStatistics(logger, viewLiveResponse.statistics, displayedRefreshInterval);
          lastSummaryDisplayMillis = elapsedTimeMillis;
        }
      }
      consecutiveErrorsCount = 0;
    } catch (error) {
      consecutiveErrorsCount++;
      handleError(logger, error, consecutiveErrorsCount);
    }
  } while (viewLiveResponse === undefined || RunStatusHelpers.isRunning(viewLiveResponse.status));

  const { assertions } = await client.getRunInformation(startedRun.runId);

  return {
    runId: startedRun.runId,
    status: viewLiveResponse?.status,
    assertions: assertions
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
