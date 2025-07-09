export interface StartSimulationRequest {
  extraSystemProperties?: Record<string, string>;
  extraEnvironmentVariables?: Record<string, string>;
  overrideHostsByPool?: Record<string, StartHostConfigurationRequest>;
  title?: string;
  description?: string;
}

export interface StartHostConfigurationRequest {
  size: number;
  weight?: number;
}
