export enum RunStatus {
  Building = 0,
  Deploying = 1,
  Deployed = 2,
  Injecting = 3,
  Successful = 4,
  AssertionsSuccessful = 5,
  AutomaticallyStopped = 6,
  ManuallyStopped = 7,
  AssertionsFailed = 8,
  Timeout = 9,
  BuildFailed = 10,
  Broken = 11,
  DeploymentFailed = 12,
  InvalidLicense = 13,
  Collected = 14,
  KillRequested = 15
}

export const statusName = (status: number): string => RunStatus[status];

const RUNNING_STATUSES = [
  RunStatus.Building,
  RunStatus.Deploying,
  RunStatus.Deployed,
  RunStatus.Injecting,
  RunStatus.Collected,
  RunStatus.KillRequested
];
const SUCCESSFUL_STATUSES = [RunStatus.Successful, RunStatus.AssertionsSuccessful];

export const isRunning = (status: number): boolean => RUNNING_STATUSES.includes(status);

export const isSuccessful = (status: number): boolean => SUCCESSFUL_STATUSES.includes(status);
