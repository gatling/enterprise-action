import * as core from "@actions/core";

import { Logger } from "@gatling-enterprise-runner/common";

const debug: (message: string) => void = core.debug;

const log: (message: string) => void = core.info;

const group = (title: string, message: string): void => {
  core.startGroup(title);
  log(message);
  core.endGroup();
};

const annotateNotice = (message: string, title?: string): void => {
  core.notice(message, { title });
};

const annotateWarning = (message: string, title?: string): void => {
  core.warning(message, { title });
};

const annotateError = (message: string, title?: string): void => {
  core.error(message, { title });
};

export const gitHubLogger: Logger = {
  debug,
  log,
  group,
  annotateNotice,
  annotateWarning,
  annotateError
};
