import fs from "fs/promises";
import path from "path";

import { Output, Logger, utils, OutputKey } from "@gatling-enterprise-runner/common";

const toOutputVarName = (key: OutputKey): string => {
  switch (key) {
    case "run_id":
      return "RUN_ID";
    case "reports_url":
      return "REPORTS_URL";
    case "runs_url":
      return "RUNS_URL";
    case "run_status_code":
      return "RUN_STATUS_CODE";
    case "run_status_name":
      return "RUN_STATUS_NAME";
    case "run_assertions":
      return "RUN_ASSERTIONS";
  }
};

const toOutputVarValue = (value: any): String => {
  if (value === null || value === undefined) {
    return "";
  } else if (typeof value === "string" || value instanceof String) {
    return value;
  } else {
    return JSON.stringify(value);
  }
};

export const dotEnvOutput = async (logger: Logger, dotEnvOutputPath?: string): Promise<Output> => {
  if (dotEnvOutputPath) {
    try {
      // Create directory if needed
      await fs.mkdir(path.dirname(dotEnvOutputPath), { recursive: true });
      // Make sure we can write to the output file
      await fs.writeFile(dotEnvOutputPath, "", "utf8");
      logger.log(`Outputs will be written to '${dotEnvOutputPath}'`);
    } catch (e) {
      throw new Error(`Unable to write outputs to '${dotEnvOutputPath}', caused by: ${utils.formatErrorMessage(e)}`);
    }
    return {
      set: (key, value) =>
        fs.appendFile(dotEnvOutputPath, `${toOutputVarName(key)}=${toOutputVarValue(value)}\n`, "utf8")
    };
  } else {
    logger.log("No output file configured, outputs will be ignored");
    return {
      set: async (key, value) => logger.debug(`Ignored output: ${toOutputVarName(key)}=${toOutputVarValue(value)}`)
    };
  }
};
