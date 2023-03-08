import runMain from "@gatling-enterprise-runner/common/src/runMain";

import { readConfig } from "./config";
import { logger } from "./log";
import { dockerState } from "./state";

const run = async () => {
  // TODO handle cleanup
  await runMain(logger, readConfig(logger), dockerState);
};

run();
