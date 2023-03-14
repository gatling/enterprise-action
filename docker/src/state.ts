import { StateStore } from "@gatling-enterprise-runner/common/src/state";

export interface DockerStateStore extends StateStore {
  getRunning: () => string | undefined;
}

let running: string | undefined;

export const dockerState: DockerStateStore = {
  setRunning: (runId) => {
    running = runId;
  },
  setFinished: () => {
    running = undefined;
  },
  getRunning: () => running
};
