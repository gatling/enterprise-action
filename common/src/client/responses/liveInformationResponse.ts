import { RunStatus } from "@src/client/models/runStatus";

export interface ViewLiveResponse {
  status: RunStatus;
  statistics?: Statistics;
}

export interface Statistics {
  _type: string;
  totalNumberOfRequests: number;
  meanRequestsPerSecond: number;
  maxConcurrentUsers: number;
  koPercentage: number;
  durationInSeconds: number;
  children: Node[];
}

export interface GroupNode {
  _type: "group";
  name: string;
  children: Node[];
}

export interface RequestNode {
  _type: "request";
  name: string;
  totalNumberOfRequests: number;
  meanRequestsPerSecond: number;
  koPercentage: number;
}

export type Node = GroupNode | RequestNode;

export function isGroupNode(node: Node): node is GroupNode {
  return node._type === "group";
}

export function isRequestNode(node: Node): node is RequestNode {
  return node._type === "request";
}
