import runMain from "./runMain";
import runCleanup from "./runCleanup";
import { getPostStatusState, setPostStatusState } from "./state";
import { logInfo } from "./utils/log";

const run = async () => {
  switch (getPostStatusState()) {
    case "post_noop":
      logInfo("Post-execution cleanup: no cleanup is required.");
      break;
    case "post_cleanup":
      logInfo("Post-execution cleanup: trying to stop simulation run if required.");
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
