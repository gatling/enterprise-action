export type OutputKey =
  | "run_id"
  | "reports_url"
  | "runs_url"
  | "run_status_code"
  | "run_status_name"
  | "run_assertions";

export interface Output {
  set: (key: OutputKey, value: any) => Promise<void>;
}
