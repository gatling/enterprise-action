import * as core from "@actions/core";

export const logDebug: (message: string) => void = core.debug;

export const log: (message: string) => void = core.info;

export const logGroup = (title: string, message: string): void => {
  core.startGroup(title);
  log(message);
  core.endGroup();
};

export const annotateNotice = (message: string, title?: string): void => {
  core.notice(message, { title });
};

export const annotateWarning = (message: string, title?: string): void => {
  core.warning(message, { title });
};

export const annotateError = (message: string, title?: string): void => {
  core.error(message, { title });
};

export const setFailed = (message: string): void => {
  core.setFailed(message);
};

export const bright = (text: string): string => "\u001b[37;1m" + text + "\u001b[0m";

export const green = (text: string): string => "\u001b[32m" + text + "\u001b[0m";

export const yellow = (text: string): string => "\u001b[33m" + text + "\u001b[0m";

export const red = (text: string): string => "\u001b[31m" + text + "\u001b[0m";
