import { expect, test } from "@jest/globals";
import {
  configKeysInputValidation,
  overrideLoadGeneratorsInputValidation,
  requiredBooleanValidation,
  uuidValidation
} from "@src/config";

test("requiredBooleanValidation", () => {
  expect(requiredBooleanValidation.validate("").ok).toBe(false);
  expect(requiredBooleanValidation.validate("Yes").ok).toBe(false);
  expect(requiredBooleanValidation.validate("TrueFalse").ok).toBe(false);

  const res1 = requiredBooleanValidation.validate("true");
  expect(res1.ok && res1.value).toBe(true);

  const res2 = requiredBooleanValidation.validate("tRuE");
  expect(res2.ok && res2.value).toBe(true);

  const res3 = requiredBooleanValidation.validate("false");
  expect(res3.ok && res3.value).toBe(false);

  const res4 = requiredBooleanValidation.validate("FALSE");
  expect(res4.ok && res4.value).toBe(false);
});

test("uuidValidation", () => {
  expect(uuidValidation.validate("").ok).toBe(false);
  expect(uuidValidation.validate("08d34c91f86247f8b19d8e92eb1abe71").ok).toBe(false);
  expect(uuidValidation.validate("08d34c91f-862-47f8-b19d-8e92eb1abe71").ok).toBe(false);

  const nullUuidRes = uuidValidation.validate("00000000-0000-0000-0000-000000000000");
  expect(nullUuidRes.ok && nullUuidRes.value).toBe("00000000-0000-0000-0000-000000000000");

  const validUUidRes = uuidValidation.validate("08d34c91-f862-47f8-b19d-8e92eb1abe71");
  expect(validUUidRes.ok && validUUidRes.value).toBe("08d34c91-f862-47f8-b19d-8e92eb1abe71");
});

test("configKeysInputValidation", () => {
  const emptyRes = configKeysInputValidation.validate("");
  expect(emptyRes.ok && emptyRes.value).toBeUndefined();

  const emptyObjectRes = configKeysInputValidation.validate("{}");
  expect(emptyObjectRes.ok && emptyObjectRes.value).toStrictEqual({});

  const validObjectRes = configKeysInputValidation.validate('{"key_1": "First value", "key_2": "Second value"}');
  expect(validObjectRes.ok && validObjectRes.value).toStrictEqual({ key_1: "First value", key_2: "Second value" });

  const validConversionsRes = configKeysInputValidation.validate(
    '{"key_1": "First value", "key_2": 42, "key_3": false}'
  );
  expect(validConversionsRes.ok && validConversionsRes.value).toStrictEqual({
    key_1: "First value",
    key_2: "42",
    key_3: "false"
  });

  expect(configKeysInputValidation.validate('"key_1": "First value"').ok).toBe(false);
  expect(configKeysInputValidation.validate('"First value"').ok).toBe(false);
  expect(configKeysInputValidation.validate('{"key_1": "First value", "key_2": ["a", "b"]}').ok).toBe(false);
});

test("hostsByPoolInputValidation", () => {
  const emptyRes = overrideLoadGeneratorsInputValidation.validate("");
  expect(emptyRes.ok && emptyRes.value).toBeUndefined();

  const emptyObjectRes = overrideLoadGeneratorsInputValidation.validate("{}");
  expect(emptyObjectRes.ok && emptyObjectRes.value).toStrictEqual({});

  const validObjectRes = overrideLoadGeneratorsInputValidation.validate(
    '{"bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66":{"size":1},"a7eb1d17-27fd-4f12-902f-488f709e644e":{"size":2, "weight":50}}'
  );
  expect(validObjectRes.ok && validObjectRes.value).toStrictEqual({
    "bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66": { size: 1 },
    "a7eb1d17-27fd-4f12-902f-488f709e644e": { size: 2, weight: 50 }
  });

  expect(overrideLoadGeneratorsInputValidation.validate('{"bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66":{}}').ok).toBe(false);
  expect(overrideLoadGeneratorsInputValidation.validate('{"key_1":{"size":1}}').ok).toBe(false);
  expect(overrideLoadGeneratorsInputValidation.validate('"bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66":{"size":1}').ok).toBe(
    false
  );
  expect(overrideLoadGeneratorsInputValidation.validate('"bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66"').ok).toBe(false);
});
