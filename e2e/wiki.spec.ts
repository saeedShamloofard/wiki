import { expect, test } from "@playwright/test";

test("home shows articles and signed-out navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Wiki sample", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign In", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign Up", exact: true })).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: /Read article/ }).first(),
    "The test database must contain at least one article with an author.",
  ).toBeVisible();
});

test("a visitor can read an article and return home without seeing owner controls", async ({ page }) => {
  await page.goto("/");
  const card = page.getByRole("main").locator('[data-slot="card"]').first();
  const link = card.getByRole("link", { name: /Read article/ });
  await expect(link).toBeVisible();
  const title = await card.locator('[data-slot="card-title"]').innerText();
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^\/wiki\/\d+$/);

  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByRole("button", { name: "Edit Article", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete", exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: /Back to Articles/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("main").getByRole("link", { name: /Read article/ }).first()).toBeVisible();
});

test("the sign-in navigation opens the login form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sign In", exact: true }).click();

  await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
});

test("an unknown route shows the custom 404 page and a working home link", async ({ page }) => {
  await page.goto("/__e2e_missing_page__");

  await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Page Not Found", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to Wiki Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("main")).toBeVisible();
});

test("a missing article shows the 404 page", async ({ page }) => {
  // Test data uses the schema's generated positive serial IDs.
  await page.goto("/wiki/0");

  await expect(page.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Wiki Home" })).toBeVisible();
});

for (const route of ["/wiki/edit/new", "/wiki/edit/1"]) {
  test(`signed-out visitors are redirected from ${route} to sign-in`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/sign-in(?:\?.*)?$/);
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Article" })).toHaveCount(0);
  });
}
