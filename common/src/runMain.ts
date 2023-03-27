import { apiClient } from "./client/apiClient";
import { Assertion } from "./client/responses/runInformationResponse";
import { Config } from "./config";
import { Logger } from "./log";
import { Output } from "./output";
import { FinishedRun, waitForRunEnd } from "./run/ongoing";
import { StartedRun, startRun } from "./run/start";
import { isSuccessful } from "./run/status";
import { StateStore } from "./state";
import { formatErrorMessage, console } from "./utils";

const { red, green, bright } = console;

export const runMain = async (output: Output, logger: Logger, config: Config, state: StateStore): Promise<void> => {
  try {
    // Do not re-run the main action when launched again later
    state.setFinished();

    const client = apiClient(config.api);

    await client.checkCloudCompatibility();

    const startedRun = await startRun(client, config);
    state.setRunning(startedRun.runId); // Run started, cleanup will be needed if interrupted now
    logStart(logger, config, startedRun);

    await output.set("run_id", startedRun.runId);
    await output.set("reports_url", startedRun.reportsUrl);
    await output.set("runs_url", startedRun.runsUrl);

    if (config.waitForRunEnd) {
      const finishedRun = await waitForRunEnd(client, logger, startedRun);
      state.setFinished(); // Run finished, no cleanup needed
      logAssertionResults(logger, finishedRun.assertions);
      logResult(logger, config, startedRun, finishedRun);

      await output.set("run_status_code", finishedRun.statusCode);
      await output.set("run_status_name", finishedRun.statusName);
      await output.set("run_assertions", finishedRun.assertions);
    } else {
      state.setFinished(); // Not waiting for run end, no cleanup needed
    }
  } catch (error) {
    logger.annotateError(formatErrorMessage(error));
    process.exitCode = 1;
  }
};

const logStart = (logger: Logger, config: Config, startedRun: StartedRun): void => {
  logger.log(bright(`Started run ${startedRun.runId} for simulation ${config.run.simulationId}`));
  logger.annotateNotice(`Run reports will be available at ${startedRun.reportsUrl}`, "Gatling Enterprise reports");
  logger.annotateNotice(`Runs history is available at ${startedRun.runsUrl}`, "Gatling Enterprise runs history");
  logger.log("");
};

const logAssertionResults = (logger: Logger, assertions: Assertion[]): void => {
  const assertionsCount = assertions.length;
  if (assertionsCount > 0) {
    logger.log("");
    logger.log(bright("Assertion results:"));
    for (const assertion of assertions) {
      if (assertion.result) {
        logger.log(green(`> ${assertion.message} succeeded with value ${assertion.actualValue}`));
      } else {
        logger.log(red(`> ${assertion.message} failed with value ${assertion.actualValue}`));
      }
    }

    const assertionErrorsCount = assertions.reduce((acc, assertion) => (assertion.result ? acc : acc + 1), 0);
    if (assertionErrorsCount > 0) {
      logger.annotateError(
        `${assertionErrorsCount} out of ${assertionsCount} assertions failed`,
        "Gatling assertion failures"
      );
    } else {
      logger.annotateNotice(`All ${assertionsCount} assertions passed successfully`, "Gatling assertions passed");
    }
  }
};

const logResult = (logger: Logger, config: Config, startedRun: StartedRun, finishedRun: FinishedRun) => {
  logger.log("");
  logger.log(bright("Simulation result:"));
  if (isSuccessful(finishedRun.statusCode)) {
    logger.log(green(`Run ${finishedRun.runId} finished with status ${finishedRun.statusName}`));
  } else {
    const errorMessage = `Run ${finishedRun.runId} failed with status ${finishedRun.statusName}`;
    logger.annotateError(errorMessage);
    if (config.failActionOnRunFailure) {
      process.exitCode = 1;
    }
  }

  logger.log("");
  logger.log(bright(`See the run reports at ${startedRun.reportsUrl}`));
  logger.log(bright(`See the runs history at ${startedRun.runsUrl}`));
};
