import { PluginFlavor } from "@src/client/models/pluginFlavor";
import { RunId } from "@src/client/models/runId";

export interface ViewLiveRequest {
  headers: {
    "X-Gatling-Plugin-Flavor": PluginFlavor;
    "X-Gatling-Plugin-Version": string;
  };
  params: {
    runId: RunId;
  };
}
