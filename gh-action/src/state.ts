import * as core from "@actions/core";

import { StateStore } from "@gatling-enterprise-runner/common";

const RUN_ID_KEY = "run_id";
const POST_STATUS_KEY = "post_status";

export type PostStatus = "post_noop" | "post_cleanup";

export interface ActionStateStore extends StateStore {
  getRunId: () => string;
  getPostStatus: () => PostStatus | undefined;
}

export const actionState: ActionStateStore = {
  setRunning: (runId) => {
    core.saveState(RUN_ID_KEY, runId);
    core.saveState(POST_STATUS_KEY, "post_cleanup");
  },
  setFinished: () => {
    core.saveState(POST_STATUS_KEY, "post_noop");
  },
  getRunId: () => core.getState(RUN_ID_KEY),
  getPostStatus: () => {
    const rawValue = core.getState(POST_STATUS_KEY);
    return rawValue === "post_noop" || rawValue === "post_cleanup" ? rawValue : undefined;
  }
};
