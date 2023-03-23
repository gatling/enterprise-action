import fs from "fs/promises";
import path from "path";

import { Output, Logger, utils } from "@gatling-enterprise-runner/common";

const toOutputString = (value: any): String => {
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
      throw new Error(`Unable to write outputs to '${dotEnvOutputPath}', cause by: ${utils.formatErrorMessage(e)}`);
    }
    return {
      set: (name, value) => fs.appendFile(dotEnvOutputPath, `${name}=${toOutputString(value)}\n`, "utf8")
    };
  } else {
    logger.log("No output file configured, outputs will be ignored");
    return {
      set: async (name, value) => logger.debug(`Ignored output: ${name}=${toOutputString(value)}`)
    };
  }
};
