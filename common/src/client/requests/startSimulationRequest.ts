export interface StartSimulationRequest {
  title?: string;
  description?: string;
  extra?: {
    systemProperties?: Record<string, string>;
    environmentVariables?: Record<string, string>;
  };
}
