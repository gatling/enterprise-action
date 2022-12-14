import * as core from "@actions/core";
import { readConfig } from "./config";
import { apiClient } from "./client/apiClient";
import { getRunIdState } from "./state";
import { formatErrorMessage } from "./utils/error";

const run = async (): Promise<void> => {
  try {
    const config = readConfig();
    const client = apiClient(config.api);
    const runId = getRunIdState();
    const stopped = await client.abortRun(runId);
    if (stopped) {
      core.info("Successfully stopped ongoing run");
    } else {
      core.info("There was no ongoing run to stop");
    }
  } catch (error) {
    core.error("Failed attempt to clean up ongoing run, caused by: " + formatErrorMessage(error));
  }
};

export default run;
