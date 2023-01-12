import { readConfig } from "./config";
import { apiClient } from "./client/apiClient";
import { getRunIdState } from "./state";
import { formatErrorMessage } from "./utils/error";
import { annotateError, log } from "./utils/log";

const run = async (): Promise<void> => {
  try {
    const config = readConfig();
    const client = apiClient(config.api);
    const runId = getRunIdState();
    const stopped = await client.abortRun(runId);
    if (stopped) {
      log("Successfully stopped ongoing run");
    } else {
      log("There was no ongoing run to stop");
    }
  } catch (error) {
    annotateError("Failed attempt to clean up ongoing run, caused by: " + formatErrorMessage(error));
  }
};

export default run;
