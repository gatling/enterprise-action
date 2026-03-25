export interface RunDetailsResponse {
  data: {
    _status: string;
    _outcome?: { successful: boolean };
    _result?: {
      assertions: Assertion[];
    };
  };
}

export interface Assertion {
  message: string;
  succeed: boolean;
  actualValue?: number;
}
