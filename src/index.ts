import * as core from "@actions/core";
import { wait } from "./wait";

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput("milliseconds");
    core.debug(`Input milliseconds=${ms}`);

    const fail: string = core.getInput("fail");
    core.debug(`Input fail=${ms}`);

    await wait(parseInt(ms, 10));

    if (fail === "true") {
      core.setFailed("The action failed.");
    } else {
      core.setOutput("result", "The action succeded");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : `Unknown error: ${error}`;
    core.setFailed(msg);
  }
}

run();
