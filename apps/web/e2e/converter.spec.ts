import { expect, test } from "@playwright/test";

test.describe("Pandoc Online", () => {
  test("homepage has converter and convert button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Pandoc Online", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Convert" })).toBeVisible();
    await expect(page.getByText("Samples")).toBeVisible();
  });

  test("privacy and terms pages", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Terms/i })).toBeVisible();
  });

  test("seo landing route loads", async ({ page }) => {
    await page.goto("/markdown-to-pdf");
    await expect(page.getByRole("button", { name: "Convert" })).toBeVisible();
  });

  test("external links in header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Twitter")).toHaveAttribute("href", /chayprabs/);
    await expect(page.getByLabel("Website")).toHaveAttribute(
      "href",
      /chaitanyaprabuddha.com/,
    );
  });
});
