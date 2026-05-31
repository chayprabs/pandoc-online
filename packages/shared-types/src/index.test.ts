import { describe, expect, it } from "vitest";
import { ALLOWED_FILTERS, CSL_STYLES, SUPPORTED_READ_FORMATS } from "./index.js";

describe("shared-types", () => {
  it("exports format lists", () => {
    expect(SUPPORTED_READ_FORMATS.length).toBeGreaterThanOrEqual(10);
    expect(CSL_STYLES).toContain("apa");
    expect(ALLOWED_FILTERS.length).toBeGreaterThan(0);
  });
});
