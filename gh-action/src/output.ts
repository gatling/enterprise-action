import * as core from "@actions/core";

import { Output } from "@gatling-enterprise-runner/common";

export const gitHubOutput: Output = {
  set: async (name: string, value: any): Promise<void> => {
    core.setOutput(name, value);
  }
};
