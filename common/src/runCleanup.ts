import { apiClient } from "./client/apiClient.js";
import { Config } from "./config.js";
import { Logger } from "./log.js";
import { formatErrorMessage } from "./utils/error.js";

export const runCleanup = async (logger: Logger, config: Config, runId: string): Promise<void> => {
  try {
    const client = apiClient(config.api);
    const stopped = await client.abortRun(runId);
    if (stopped) {
      logger.log("Successfully stopped ongoing run");
    } else {
      logger.log("There was no ongoing run to stop");
    }
  } catch (error) {
    logger.annotateError("Failed attempt to clean up ongoing run, caused by: " + formatErrorMessage(error));
  }
};
