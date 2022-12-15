import { readConfig } from "./config";
import { apiClient } from "./client/apiClient";
import { getRunIdState } from "./state";
import { formatErrorMessage } from "./utils/error";
import { logError, logInfo } from "./utils/log";

const run = async (): Promise<void> => {
  try {
    const config = readConfig();
    const client = apiClient(config.api);
    const runId = getRunIdState();
    const stopped = await client.abortRun(runId);
    if (stopped) {
      logInfo("Successfully stopped ongoing run");
    } else {
      logInfo("There was no ongoing run to stop");
    }
  } catch (error) {
    logError("Failed attempt to clean up ongoing run, caused by: " + formatErrorMessage(error));
  }
};

export default run;
