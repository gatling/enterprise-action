import { format } from "date-fns";

import { Logger } from "../log.js";
import { formatDuration } from "../utils/index.js";
import { GroupNode, isGroupNode, Node, RequestNode, Statistics } from "../client/responses/liveInformationResponse.js";

export const logViewLiveStatistics = (
  logger: Logger,
  runLiveStatistics: Statistics,
  nextSummaryDelayMillis: number
) => {
  logLiveStatistics(logger, runLiveStatistics, nextSummaryDelayMillis);
};

const recursivelyGetChildren = (children: Node[]): Node[] =>
  children.map((child: Node) =>
    isGroupNode(child) ? { ...child, children: recursivelyGetChildren(child.children) } : child
  );

const logLiveStatistics = (logger: Logger, runLiveStatistics: Statistics, nextSummaryDelay: number) => {
  const currentTimestamp = Date.now();
  const date = format(currentTimestamp, "yyyy-MM-dd HH:mm:ss");
  const listMetric = recursivelyGetChildren(runLiveStatistics.children ?? []);

  logger.group(
    `Time: ${date}, ${formatDuration(runLiveStatistics.durationInSeconds)} elapsed, next refresh in ${formatDuration(
      nextSummaryDelay
    )}`,
    `Number of concurrent users: ${runLiveStatistics.maxConcurrentUsers}\n` +
      `Number of requests: ${runLiveStatistics.totalNumberOfRequests}\n` +
      `Number of requests per seconds: ${runLiveStatistics.meanRequestsPerSecond}\n` +
      formatListMetrics(listMetric)
  );
};

const formatListMetrics = (listMetric: Node[]): string => {
  const recurs = (listMetric: Node[], level: number): string[] => {
    const padding = " ".repeat(2 * level);
    const formatGroupNode = (groupName: GroupNode): string => `${padding}> Group ${groupName.name}`;
    const formatRequestNode = (requestNode: RequestNode): string[] => [
      `${padding}> Request ${requestNode.name}`,
      `${padding}   Counts: ${requestNode.totalNumberOfRequests}`,
      `${padding}   Requests per seconds: ${requestNode.meanRequestsPerSecond}`,
      `${padding}   Failure ratio: ${requestNode.koPercentage}%`
    ];
    return listMetric.flatMap((child) =>
      isGroupNode(child) ? [formatGroupNode(child), ...recurs(child.children, level + 1)] : formatRequestNode(child)
    );
  };
  return recurs(listMetric, 0).join("\n");
};
