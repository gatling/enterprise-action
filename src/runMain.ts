import * as core from "@actions/core";
import { readConfig } from "./config";
import { apiClient } from "./client/apiClient";
import { isSuccessful } from "./run/status";
import { startRun } from "./run/start";
import { FinishedRun, waitForRunEnd } from "./run/ongoing";
import { formatErrorMessage } from "./utils/error";
import { setPostStatusState, setRunIdState } from "./state";
import { logError, logSuccess, setFailed } from "./utils/log";

const run = async (): Promise<void> => {
  try {
    const config = readConfig();
    const client = apiClient(config.api);

    await client.checkCloudCompatibility();

    const startedRun = await startRun(client, config);
    setRunIdState(startedRun.runId);
    setPostStatusState("post_cleanup"); // Run started, cleanup will be needed if interrupted now
    core.setOutput("run_id", startedRun.runId);
    core.setOutput("reports_url", startedRun.reportsUrl);
    core.setOutput("runs_url", startedRun.runsUrl);

    const finishedRun = await waitForRunEnd(client, startedRun);
    setPostStatusState("post_noop"); // Run finished, no cleanup needed
    logResult(finishedRun);

    core.setOutput("runs_status_code", finishedRun.statusCode);
    core.setOutput("runs_status_name", finishedRun.statusName);
    core.setOutput("run_assertions", finishedRun.assertions);
  } catch (error) {
    setFailed(formatErrorMessage(error));
  }
};

const logResult = (finishedRun: FinishedRun) => {
  if (isSuccessful(finishedRun.statusCode)) {
    logSuccess(`Run ${finishedRun.runId} finished with status ${finishedRun.statusName}`);
  } else {
    setFailed(`Run ${finishedRun.runId} failed with status ${finishedRun.statusName}`);
  }

  for (const assertion of finishedRun.assertions) {
    if (assertion.result) {
      logSuccess(`${assertion.message} succeeded with value ${assertion.actualValue}`);
    } else {
      logError(`${assertion.message} failed with value ${assertion.actualValue}`);
    }
  }
};

export default run;
