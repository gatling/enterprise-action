export interface StateStore {
  setRunning: (runId: string) => void;
  setFinished: () => void;
}
