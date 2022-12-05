import * as core from "@actions/core";
import { readConfig } from "./config";
import { apiClient } from "./client/apiClient";

async function run(): Promise<void> {
  try {
    const config = readConfig();
    const client = apiClient(config.api);
    const simulations = await client.getSimulations(); // TODO RND-6 Start simulation instead
    core.setOutput("result", `Found {} ${simulations.length} simulations.`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : `Unknown error: ${error}`;
    core.setFailed(msg);
  }
}

run();
