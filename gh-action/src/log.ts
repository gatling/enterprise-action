import * as core from "@actions/core";

import { Logger } from "@gatling-enterprise-runner/common/src/log";

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

const setOutput = (name: string, value: any): void => {
  core.setOutput(name, value);
};

export const logger: Logger = {
  debug,
  log,
  group,
  annotateNotice,
  annotateWarning,
  annotateError,
  setOutput
};
