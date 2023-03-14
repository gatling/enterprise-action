import { Logger } from "@gatling-enterprise-runner/common/src/log";

const log: (message: string) => void = console.info;

const debug: (message: string) => void =
  // On Node.js, console.debug is just an alias to console.log, so we handle debug level ourselves
  process.env["DEBUG"] === "true" ? log : () => {};

const group = (title: string, message: string): void => {
  const firstLine = title ? title + "\n" : "";
  log(firstLine + message + "\n");
};

const annotateNotice = (message: string, title?: string): void => {
  const formatted = title ? title + "\n" + message : message;
  log(formatted);
};

const annotateWarning = (message: string, title?: string): void => {
  const formatted = title ? "[WARN] " + title + "\n" + message : "[WARN] " + message;
  log(formatted);
};

const annotateError = (message: string, title?: string): void => {
  const formatted = title ? "[ERROR] " + title + "\n" + message : "[ERROR] " + message;
  log(formatted);
};

const setOutput = (name: string, value: any): void => {
  let formattedValue: string | String;
  if (value === null || value === undefined) {
    formattedValue = "";
  } else if (typeof value === "string" || value instanceof String) {
    formattedValue = value;
  } else {
    formattedValue = JSON.stringify(value);
  }
  // TODO see how to actually handle outputs
  log(`[OUTPUT] ${name}: ${formattedValue}`);
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
