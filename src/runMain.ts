import * as core from "@actions/core";
import { ActionConfig, readConfig } from "./config";
import { apiClient } from "./client/apiClient";
import { isSuccessful } from "./run/status";
import { StartedRun, startRun } from "./run/start";
import { FinishedRun, waitForRunEnd } from "./run/ongoing";
import { formatErrorMessage } from "./utils/error";
import { setPostStatusState, setRunIdState } from "./state";
import { annotateError, annotateNotice, bright, green, log, red, setFailed } from "./utils/log";
import { Assertion } from "./client/responses/runInformationResponse";

const run = async (): Promise<void> => {
  try {
    const config = readConfig();
    const client = apiClient(config.api);

    await client.checkCloudCompatibility();

    const startedRun = await startRun(client, config);
    setRunIdState(startedRun.runId);
    setPostStatusState("post_cleanup"); // Run started, cleanup will be needed if interrupted now
    logStart(config, startedRun);

    core.setOutput("run_id", startedRun.runId);
    core.setOutput("reports_url", startedRun.reportsUrl);
    core.setOutput("runs_url", startedRun.runsUrl);

    if (config.waitForRunEnd) {
      const finishedRun = await waitForRunEnd(client, startedRun);
      setPostStatusState("post_noop"); // Run finished, no cleanup needed
      logAssertionResults(finishedRun.assertions);
      logResult(config, startedRun, finishedRun);

      core.setOutput("runs_status_code", finishedRun.statusCode);
      core.setOutput("runs_status_name", finishedRun.statusName);
      core.setOutput("run_assertions", finishedRun.assertions);
    } else {
      setPostStatusState("post_noop"); // Not waiting for run end, no cleanup needed
    }
  } catch (error) {
    setFailed(formatErrorMessage(error));
  }
};

const logStart = (config: ActionConfig, startedRun: StartedRun): void => {
  log(bright(`Started run ${startedRun.runId} for simulation ${config.run.simulationId}`));
  if (startedRun.reportsUrl) {
    annotateNotice(`Run reports will be available at ${startedRun.reportsUrl}`, "Gatling Enterprise reports");
  }
  if (startedRun.runsUrl) {
    annotateNotice(`Runs history is available at ${startedRun.runsUrl}`, "Gatling Enterprise runs history");
  }
  log("");
};

const logAssertionResults = (assertions: Assertion[]): void => {
  const assertionsCount = assertions.length;
  if (assertionsCount > 0) {
    log("");
    log(bright("Assertion results:"));
    for (const assertion of assertions) {
      if (assertion.result) {
        log(green(`> ${assertion.message} succeeded with value ${assertion.actualValue}`));
      } else {
        log(red(`> ${assertion.message} failed with value ${assertion.actualValue}`));
      }
    }

    const assertionErrorsCount = assertions.reduce((acc, assertion) => (assertion.result ? acc : acc + 1), 0);
    if (assertionErrorsCount > 0) {
      annotateError(
        `${assertionErrorsCount} out of ${assertionsCount} assertions failed`,
        "Gatling assertion failures"
      );
    } else {
      annotateNotice(`All ${assertionsCount} assertions passed successfully`, "Gatling assertions passed");
    }
  }
};

const logResult = (config: ActionConfig, startedRun: StartedRun, finishedRun: FinishedRun) => {
  log("");
  log(bright("Simulation result:"));
  if (isSuccessful(finishedRun.statusCode)) {
    log(green(`Run ${finishedRun.runId} finished with status ${finishedRun.statusName}`));
  } else {
    const errorMessage = `Run ${finishedRun.runId} failed with status ${finishedRun.statusName}`;
    annotateError(errorMessage);
    if (config.failActionOnRunFailure) {
      process.exitCode = core.ExitCode.Failure;
    }
  }

  log("");
  if (startedRun.reportsUrl) {
    log(bright(`See the run reports at ${startedRun.reportsUrl}`));
  }
  if (startedRun.runsUrl) {
    log(bright(`See the runs history at ${startedRun.runsUrl}`));
  }
};

export default run;
