import { apiClient } from "./client/apiClient";
import { Config } from "./config";
import { Logger } from "./log";
import { formatErrorMessage } from "./utils/error";

const run = async (logger: Logger, config: Config, runId: string): Promise<void> => {
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

export default run;
