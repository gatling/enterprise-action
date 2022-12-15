import * as core from "@actions/core";

export const logDebug = (message: string): void => {
  core.debug(message);
};

export const logInfo = (message: string): void => {
  core.info(message);
};

export const logInfoGroup = (title: string, message: string): void => {
  core.startGroup(title);
  logInfo(message);
  core.endGroup();
};

export const logSuccess = (message: string): void => {
  core.info(green(message));
};

export const logWarning = (message: string): void => {
  core.warning(yellow(message));
};

export const logError = (message: string): void => {
  core.error(red(message));
};

export const setFailed = (message: string): void => {
  core.setFailed(red(message));
};

const red = (text: string): string => "\u001b[31m" + text + "\u001b[0m";

const green = (text: string): string => "\u001b[32m" + text + "\u001b[0m";

const yellow = (text: string): string => "\u001b[33m" + text + "\u001b[0m";
