import { expect, test } from "bun:test";
import { failure, success, temperature } from "../../src/utils/colors.ts";

test("color utilities produce stable labels", () => {
  expect(success("ok")).toContain("ok");
  expect(failure("bad")).toContain("bad");
  expect(temperature("warm")).toContain("warm");
});
