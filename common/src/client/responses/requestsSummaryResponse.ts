export interface RequestsSummaryResponse {
  name: string;
  responseTime: ResponseTimeRequestsSummary;
  in: InRequestsSummary;
  out: OutRequestsSummary;
  children?: RequestsSummaryChild[];
}

export interface RequestsSummaryChild {
  name: string;
  responseTime: ResponseTimeRequestsSummary;
  in: InRequestsSummary;
  out: OutRequestsSummary;
  index?: number;
  children?: RequestsSummaryChild[];
}

export interface ResponseTimeRequestsSummary {
  mean: number;
  stdDev: number;
  percentiles: number[];
}

export interface InRequestsSummary {
  counts: {
    ok: number;
    ko: number;
    koPercent: number;
    total: number;
  };
  rps: {
    ok: number;
    ko: number;
    total: number;
  };
}

export interface OutRequestsSummary {
  counts: { total: number };
  rps: { total: number };
}
