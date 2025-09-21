export enum RunStatus {
  Building = "building",
  Deploying = "deploying",
  Deployed = "deployed",
  Injecting = "injecting",
  Successful = "successful",
  AssertionsSuccessful = "assertions_successful",
  AutomaticallyStopped = "automatically_stopped",
  ManuallyStopped = "manually_stopped",
  AssertionsFailed = "assertions_failed",
  Timeout = "timeout",
  BuildFailed = "build_failed",
  Broken = "broken",
  DeploymentFailed = "deployment_failed",
  InvalidLicense = "invalid_license",
  StopRequested = "stop_requested",
  StopCriteriaTriggered = "stop_criteria_triggered"
}

export const RunStatusDisplayNames: Record<RunStatus, string> = {
  [RunStatus.Building]: "Building",
  [RunStatus.Deploying]: "Deploying",
  [RunStatus.Deployed]: "Deployed",
  [RunStatus.Injecting]: "Injecting",
  [RunStatus.Successful]: "Successful",
  [RunStatus.AssertionsSuccessful]: "Assertions successful",
  [RunStatus.AutomaticallyStopped]: "Automatically stopped",
  [RunStatus.ManuallyStopped]: "Manually stopped",
  [RunStatus.AssertionsFailed]: "Assertions failed",
  [RunStatus.Timeout]: "Timeout",
  [RunStatus.BuildFailed]: "Build failed",
  [RunStatus.Broken]: "Broken",
  [RunStatus.DeploymentFailed]: "Deployment failed",
  [RunStatus.InvalidLicense]: "Invalid license",
  [RunStatus.StopRequested]: "Stop requested",
  [RunStatus.StopCriteriaTriggered]: "Stop criteria triggered"
};

export const RunStatusHelpers = {
  isRunning(status: RunStatus): boolean {
    return (
      status === RunStatus.Building ||
      status === RunStatus.Deploying ||
      status === RunStatus.Deployed ||
      status === RunStatus.Injecting ||
      status === RunStatus.StopRequested
    );
  },

  isSuccessful(status: RunStatus): boolean {
    return status === RunStatus.Successful || status === RunStatus.AssertionsSuccessful;
  }
};
