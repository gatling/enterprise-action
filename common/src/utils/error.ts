import { HttpClientError } from "@actions/http-client";

export const formatErrorMessage = (error: any): string => {
  if (error instanceof HttpClientError) {
    return `HttpClientError ${error.statusCode}: ${error.message}`;
  } else if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  } else {
    return `Unknown error: ${error}`;
  }
};
