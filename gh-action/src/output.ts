import * as core from "@actions/core";

import { Output } from "@gatling-enterprise-runner/common";

export const gitHubOutput: Output = {
  set: async (key, value): Promise<void> => {
    core.setOutput(key, value);

    // Should use run_status_code/run_status_name (without 's', this refers to only one run)
    // runs_status_code/runs_status_name are kept for backward compatibility since 1.0, can be removed in 2.x
    if (key === "run_status_code") {
      core.setOutput("runs_status_code", value);
    }
    if (key === "run_status_name") {
      core.setOutput("runs_status_name", value);
    }
  }
};
