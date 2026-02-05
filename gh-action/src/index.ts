import { runCleanup, runMain } from "@gatling-enterprise-runner/common";

import { readConfig } from "./config.js";
import { gitHubLogger } from "./log.js";
import { gitHubOutput } from "./output.js";
import { actionState } from "./state.js";

const run = async () => {
  switch (actionState.getPostStatus()) {
    case "post_noop":
      gitHubLogger.log("Post-execution cleanup: no cleanup is required.");
      break;
    case "post_cleanup":
      gitHubLogger.log("Post-execution cleanup: trying to stop simulation run if required.");
      await runCleanup(gitHubLogger, readConfig(gitHubLogger), actionState.getRunId());
      break;
    default:
      await runMain(gitHubOutput, gitHubLogger, readConfig(gitHubLogger), actionState);
      break;
  }
};

run();
