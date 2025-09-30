import * as core from "@actions/core";

import { Output } from "@gatling-enterprise-runner/common";

export const gitHubOutput: Output = {
  set: async (key, value): Promise<void> => {
    core.setOutput(key, value);
  }
};
