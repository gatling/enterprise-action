import * as core from "@actions/core";

import runMain from "./runMain";
import runCleanup from "./runCleanup";
import { getPostStatusState, setPostStatusState } from "./state";

const run = async () => {
  switch (getPostStatusState()) {
    case "post_noop":
      core.info("Post-execution cleanup: no cleanup is required.");
      break;
    case "post_cleanup":
      core.info("Post-execution cleanup: trying to stop simulation run if required.");
      await runCleanup();
      break;
    default:
      // Do not re-run the main action when launched again later
      setPostStatusState("post_noop");
      await runMain();
      break;
  }
};

run();
