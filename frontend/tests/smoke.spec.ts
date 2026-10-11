import { expect, test } from "@playwright/test";

test("login page loads", async ({ page }) => {
  await page.goto("/login");

  await expect(page).toHaveTitle(/ExamScope AI/i);

  await expect(
    page.getByRole("heading", {
      name: "Welcome back",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Sign in",
    }),
  ).toBeVisible();
});

test("unauthenticated user is redirected from dashboard to login", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login/);

  await expect(
    page.getByRole("heading", {
      name: "Welcome back",
    }),
  ).toBeVisible();
});

test("register page loads", async ({ page }) => {
  await page.goto("/register");

  await expect(page).toHaveTitle(/ExamScope AI/i);

  await expect(
    page.getByRole("heading", {
      name: /create account|register/i,
    }),
  ).toBeVisible();
});

test("user can sign in, access dashboard, and sign out", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E credentials are not configured.");
  }

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await expect(
    page.getByRole("heading", {
      name: /dashboard/i,
    }),
  ).toBeVisible();

  await page.getByRole("button", {
    name: /logout|sign out/i,
  }).click();

  await expect(page).toHaveURL(/\/login/);
});

test("authenticated user can access core student pages", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E credentials are not configured.");
  }

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);

  await page.getByRole("button", {
    name: "Sign in",
  }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  const routes = [
    "/subjects",
    "/uploads",
    "/analysis",
    "/predictions",
    "/generate",
    "/mock-exams",
    "/revision",
    "/analytics",
  ];

  for (const route of routes) {
    await page.goto(route);

    await expect(page).toHaveURL(
      new RegExp(`${route.replace("/", "\\/")}(?:\\?.*)?$`),
    );

    await expect(page.locator("main")).toBeVisible();
  }
});