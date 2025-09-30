import assert from "assert";

/**
 * Formats duration with a format like "2h 25m 12s".
 * @param duration duration in seconds
 */
export const formatDuration = (durationInSecond: number): string => {
  assert(durationInSecond >= 0, "Cannot format negative duration");

  let formattedStr = "";
  let remainder = durationInSecond;

  const addFormattedValue = (lengthSeconds: number, symbol: string): void => {
    if (durationInSecond >= lengthSeconds) {
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
