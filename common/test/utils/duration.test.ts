import { expect, test } from "@jest/globals";
import { formatDuration } from "@src/utils/duration.js";

test("formatDuration d/h/m/s", () => {
  expect(formatDuration(181297)).toBe("2d 2h 21m 37s");
});

test("formatDuration d/h/m/s with exact day", () => {
  expect(formatDuration(172800)).toBe("2d 0h 0m 0s");
});

test("formatDuration h/m/s", () => {
  expect(formatDuration(84097)).toBe("23h 21m 37s");
});

test("formatDuration h/m/s with exact hour", () => {
  expect(formatDuration(79200)).toBe("22h 0m 0s");
});

test("formatDuration m/s", () => {
  expect(formatDuration(2302)).toBe("38m 22s");
});

test("formatDuration m/s with exact minute", () => {
  expect(formatDuration(2280)).toBe("38m 0s");
});

test("formatDuration s", () => {
  expect(formatDuration(22)).toBe("22s");
});

test("formatDuration zero duration", () => {
  expect(formatDuration(0)).toBe("0s");
});

test("formatDuration negative duration", () => {
  expect(() => formatDuration(-15)).toThrow();
});
