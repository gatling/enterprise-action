import { addCleanupListener } from "async-cleanup";

import runCleanup from "@gatling-enterprise-runner/common/src/runCleanup";
import runMain from "@gatling-enterprise-runner/common/src/runMain";

import { readConfig } from "./config";
import { logger } from "./log";
import { dotEnvOutput } from "./output";
import { dockerState } from "./state";

const run = async () => {
  const config = readConfig(logger);
  const output = await dotEnvOutput(logger, config.outputDotEnvPath);

  addCleanupListener(async () => {
    const running = dockerState.getRunning();
    if (running) {
      await runCleanup(logger, config, running);
    }
  });

  await runMain(output, logger, config, dockerState);
};

run();
