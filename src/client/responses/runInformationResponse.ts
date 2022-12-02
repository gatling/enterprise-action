export interface RunInformationResponse {
  incrementalId: number;
  runId: string;
  scenario: string;
  group: string;
  request: string;
  buildStart: number;
  buildEnd: number;
  deployStart: number;
  deployEnd: number;
  injectStart: number;
  injectEnd: number;
  status: number;
  assertions: Assertion[];
  error?: string;
  comments: Comment;
  runSnapshot: RunSnapshot;
}

export interface Assertion {
  message: string;
  result: boolean;
  actualValue?: number;
}

export interface Comment {
  title: string;
  description: string;
}

export interface RunSnapshot {
  simulationName: string;
  systemProperties: Record<string, string>;
  simulationClass: string;
  poolSnapshots: PoolSnapshot[];
}

export interface PoolSnapshot {
  poolName: string;
}
