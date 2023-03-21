import { Logger, bright } from "@gatling-enterprise-runner/common/src/log";

const log: (message: string) => void = console.info;

const debug: (message: string) => void =
  // On Node.js, console.debug is just an alias to console.log, so we handle debug level ourselves
  process.env["DEBUG"] === "true" ? log : () => {};

const group = (title: string, message: string): void => {
  const firstLine = title ? bright(title) + "\n" : "";
  log(firstLine + message + "\n");
};

const annotateNotice = (message: string, title?: string): void => {
  const formatted = title ? bright(title) + "\n" + message : message;
  log(formatted);
};

const annotateWarning = (message: string, title?: string): void => {
  const formatted = title ? bright("[WARN] " + title) + "\n" + message : "[WARN] " + message;
  log(formatted);
};

const annotateError = (message: string, title?: string): void => {
  const formatted = title ? bright("[ERROR] " + title) + "\n" + message : "[ERROR] " + message;
  log(formatted);
};

export const logger: Logger = {
  debug,
  log,
  group,
  annotateNotice,
  annotateWarning,
  annotateError
};
