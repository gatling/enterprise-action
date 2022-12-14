import * as core from "@actions/core";

export const RUN_ID_KEY = "run_id";
export const POST_STATUS_KEY = "post_status";

export const setRunIdState = (runId: string) => core.saveState(RUN_ID_KEY, runId);
export const getRunIdState = () => core.getState(RUN_ID_KEY);

export type PostStatus = "post_noop" | "post_cleanup";
export const setPostStatusState = (status: PostStatus) => core.saveState(POST_STATUS_KEY, status);
export const getPostStatusState = (): PostStatus | undefined => {
  const rawValue = core.getState(POST_STATUS_KEY);
  return rawValue === "post_noop" || rawValue === "post_cleanup" ? rawValue : undefined;
};
