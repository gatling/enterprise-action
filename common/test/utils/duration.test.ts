import { expect, test } from "@jest/globals";
import { formatDurationDiff } from "@src/utils/duration";

test("formatDuration d/h/m/s", () => {
  const start = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  const end = new Date(2022, 12, 16, 10, 13, 52, 12).getTime();
  expect(formatDurationDiff(start, end)).toBe("2d 2h 21m 37s");
});

test("formatDuration d/h/m/s with exact day", () => {
  const start = new Date(2022, 12, 14, 7, 52, 15, 24).getTime();
  const end = new Date(2022, 12, 16, 7, 52, 15, 29).getTime();
  expect(formatDurationDiff(start, end)).toBe("2d 0h 0m 0s");
});

test("formatDuration h/m/s", () => {
  const start = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  const end = new Date(2022, 12, 15, 7, 13, 52, 12).getTime();
  expect(formatDurationDiff(start, end)).toBe("23h 21m 37s");
});

test("formatDuration h/m/s with exact hour", () => {
  const start = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  const end = new Date(2022, 12, 15, 5, 52, 15, 12).getTime();
  expect(formatDurationDiff(start, end)).toBe("22h 0m 0s");
});

test("formatDuration m/s", () => {
  const start = new Date(2022, 12, 14, 7, 13, 52, 12).getTime();
  const end = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  expect(formatDurationDiff(start, end)).toBe("38m 22s");
});

test("formatDuration m/s with exact minute", () => {
  const start = new Date(2022, 12, 14, 7, 13, 25, 58).getTime();
  const end = new Date(2022, 12, 14, 7, 51, 26, 5).getTime();
  expect(formatDurationDiff(start, end)).toBe("38m 0s");
});

test("formatDuration s", () => {
  const start = new Date(2022, 12, 14, 7, 51, 52, 12).getTime();
  const end = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  expect(formatDurationDiff(start, end)).toBe("22s");
});

test("formatDuration zero duration", () => {
  const start = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  const end = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  expect(formatDurationDiff(start, end)).toBe("0s");
});

test("formatDuration negative duration", () => {
  const start = new Date(2022, 12, 14, 7, 52, 15, 0).getTime();
  const end = new Date(2022, 12, 14, 7, 52, 14, 0).getTime();
  expect(() => formatDurationDiff(start, end)).toThrow();
});
