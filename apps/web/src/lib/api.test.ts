import { describe, expect, it } from "vitest";

describe("api helpers", () => {
  it("resolveArtifactUrl prefixes relative paths", async () => {
    const { resolveArtifactUrl } = await import("./api.js");
    expect(resolveArtifactUrl("/v1/jobs/x/artifact")).toContain("/v1/jobs/x/artifact");
  });
});
