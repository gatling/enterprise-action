import runCleanup from "@gatling-enterprise-runner/common/src/runCleanup";
import runMain from "@gatling-enterprise-runner/common/src/runMain";

import { readConfig } from "./config";
import { logger } from "./log";
import { actionState } from "./state";

const run = async () => {
  switch (actionState.getPostStatus()) {
    case "post_noop":
      logger.log("Post-execution cleanup: no cleanup is required.");
      break;
    case "post_cleanup":
      logger.log("Post-execution cleanup: trying to stop simulation run if required.");
      await runCleanup(logger, readConfig(logger), actionState.getRunId());
      break;
    default:
      await runMain(logger, readConfig(logger), actionState);
      break;
  }
};

run();
