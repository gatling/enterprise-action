import assert from "assert";

/**
 * Formats duration with a format like "2h 25m 12s".
 * @param start timestamp in milliseconds
 * @param end timestamp in milliseconds
 */
export const formatDuration = (start: number, end: number): string => {
  const totalSeconds = Math.floor((end - start) / 1000);
  assert(totalSeconds >= 0, "Cannot format negative duration");

  let formattedStr = "";
  let remainder = totalSeconds;

  const addFormattedValue = (lengthSeconds: number, symbol: string): void => {
    if (totalSeconds >= lengthSeconds) {
      const value = Math.floor(remainder / lengthSeconds);
      remainder = remainder % lengthSeconds;
      formattedStr += value + symbol;
    }
  };
  addFormattedValue(86400, "d ");
  addFormattedValue(3600, "h ");
  addFormattedValue(60, "m ");

  return formattedStr + remainder + "s";
};
