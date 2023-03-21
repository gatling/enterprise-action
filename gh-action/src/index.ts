import runCleanup from "@gatling-enterprise-runner/common/src/runCleanup";
import runMain from "@gatling-enterprise-runner/common/src/runMain";

import { readConfig } from "./config";
import { gitHubLogger } from "./log";
import { gitHubOutput } from "./output";
import { actionState } from "./state";

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
