import { format } from "date-fns";

import { ApiClient } from "../client/apiClient";
import { RequestsSummaryChild } from "../client/responses/requestsSummaryResponse";
import { RunInformationResponse } from "../client/responses/runInformationResponse";
import { Logger } from "../log";
import { formatDuration } from "../utils";

export const getAndLogMetricsSummary = async (client: ApiClient, logger: Logger, runInfo: RunInformationResponse) => {
  const metricsSummary = await getMetricsSummary(client, runInfo);
  logMetricsSummary(logger, metricsSummary);
};

const getMetricsSummary = async (client: ApiClient, runInfo: RunInformationResponse): Promise<MetricsSummary> => {
  const [seriesResponse, requestsSummary] = await Promise.all([
    client.getConcurrentUserMetric(runInfo.runId, runInfo.scenario),
    client.getRequestsSummary(runInfo.runId)
  ]);

  const currentTimestamp = Date.now();
  const date = format(currentTimestamp, "yyyy-MM-dd HH:mm:ss");
  const duration = formatDuration(runInfo.injectStart, currentTimestamp);

  const nbUsers = seriesResponse
    .map(({ values }) => (values.length === 0 ? 0.0 : values[values.length - 1]))
    .reduce((acc, next) => acc + next, 0.0);

  const nbRequest = requestsSummary.out.counts.total;
  const requestsSeconds = requestsSummary.out.rps.total;
  const failureRatio = requestsSummary.in.counts.koPercent;
  const listMetric = recursivelyGetChildren(requestsSummary.children ?? []);

  return {
    date,
    duration,
    nbUsers,
    nbRequest,
    requestsSeconds,
    failureRatio,
    listMetric
  };
};

const recursivelyGetChildren = (children: RequestsSummaryChild[]): ChildMetric[] =>
  children.map((child) =>
    child.children
      ? { name: child.name, children: recursivelyGetChildren(child.children) }
      : {
          name: child.name,
          nbRequest: child.out.counts.total,
          failureRatio: child.in.counts.koPercent,
          requestsSeconds: child.out.rps.total
        }
  );

const logMetricsSummary = (logger: Logger, summary: MetricsSummary) => {
  logger.group(
    `Time: ${summary.date}, ${summary.duration} elapsed`,
    (summary.nbUsers > 0 ? `Number of concurrent users: ${summary.nbUsers}\n` : "") +
      `Number of requests: ${summary.nbRequest}\n` +
      `Number of requests per seconds: ${summary.requestsSeconds}\n` +
      formatListMetrics(summary.listMetric)
  );
};

const formatListMetrics = (listMetric: ChildMetric[]): string => {
  const recurs = (listMetric: ChildMetric[], level: number): string[] => {
    const padding = " ".repeat(2 * level);
    const formatNode = (node: ChildMetricNode): string => `${padding}> Group ${node.name}`;
    const formatLeaf = (leaf: ChildMetricLeaf): string[] => [
      `${padding}> Request ${leaf.name}`,
      `${padding}   Counts: ${leaf.nbRequest}`,
      `${padding}   Requests per seconds: ${leaf.requestsSeconds}`,
      `${padding}   Failure ratio: ${leaf.failureRatio}%`
    ];
    return listMetric.flatMap((child) =>
      isChildMetricLeaf(child) ? formatLeaf(child) : [formatNode(child), ...recurs(child.children, level + 1)]
    );
  };
  return recurs(listMetric, 0).join("\n");
};

interface MetricsSummary {
  date: string;
  duration: string;
  nbUsers: number;
  nbRequest: number;
  requestsSeconds: number;
  failureRatio: number;
  listMetric: ChildMetric[];
}

type ChildMetric = ChildMetricLeaf | ChildMetricNode;

interface ChildMetricLeaf {
  name: string;
  nbRequest: number;
  failureRatio: number;
  requestsSeconds: number;
}

const isChildMetricLeaf = (o: ChildMetric): o is ChildMetricLeaf => !("children" in o);

interface ChildMetricNode {
  name: string;
  children: ChildMetric[];
}
