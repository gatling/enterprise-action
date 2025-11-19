import { expect, test } from "@jest/globals";
import {
  configKeysInputValidation,
  overrideLoadGeneratorsInputValidation,
  requiredBooleanValidation,
  parseStrictlyPositiveNumberValidation
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
  expect(overrideLoadGeneratorsInputValidation.validate('{"key_1":{"size":1}}').ok).toBe(true);
  expect(overrideLoadGeneratorsInputValidation.validate('{"":{"size":1}}').ok).toBe(false);
  expect(overrideLoadGeneratorsInputValidation.validate('"bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66":{"size":1}').ok).toBe(
    false
  );
  expect(overrideLoadGeneratorsInputValidation.validate('"bcf62ac8-90a0-4be7-acd0-d7e87e3cbd66"').ok).toBe(false);
});

test("parseNumberValidation", () => {
  const exactRes = parseStrictlyPositiveNumberValidation(5).validate("5");
  expect(exactRes.ok && exactRes.value).toStrictEqual(5);

  const floatRoundUpRes1 = parseStrictlyPositiveNumberValidation(5).validate("3.9");
  expect(floatRoundUpRes1.ok && floatRoundUpRes1.value).toStrictEqual(5);

  const floatRoundUpRes2 = parseStrictlyPositiveNumberValidation(1).validate("3.9");
  expect(floatRoundUpRes2.ok && floatRoundUpRes2.value).toStrictEqual(4);

  const integerRoundUpRes = parseStrictlyPositiveNumberValidation(5).validate("42");
  expect(integerRoundUpRes.ok && integerRoundUpRes.value).toStrictEqual(45);

  const expRes = parseStrictlyPositiveNumberValidation(5).validate("1.23e5");
  expect(expRes.ok && expRes.value).toStrictEqual(123000);

  expect(parseStrictlyPositiveNumberValidation(5).validate("").ok).toBe(false);
  expect(parseStrictlyPositiveNumberValidation(5).validate("foo").ok).toBe(false);
  expect(parseStrictlyPositiveNumberValidation(5).validate("0").ok).toBe(false);
  expect(parseStrictlyPositiveNumberValidation(5).validate("-5.1").ok).toBe(false);
});
