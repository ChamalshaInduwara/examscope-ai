import { describe, expect, it } from "vitest";

import { registerSchema } from "@/lib/validations/auth";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "viraj@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(result.success).toBe(true);
  });

  it("trims the user's name and email", () => {
    const result = registerSchema.safeParse({
      name: "  Viraj Jayasiri  ",
      email: "  viraj@example.com  ",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Viraj Jayasiri");
      expect(result.data.email).toBe("viraj@example.com");
    }
  });

  it("rejects an invalid email address", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "invalid-email",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "viraj@example.com",
      password: "Pass1",
      confirmPassword: "Pass1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "viraj@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password without a lowercase letter", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "viraj@example.com",
      password: "PASSWORD123",
      confirmPassword: "PASSWORD123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "viraj@example.com",
      password: "Password",
      confirmPassword: "Password",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = registerSchema.safeParse({
      name: "Viraj Jayasiri",
      email: "viraj@example.com",
      password: "Password123",
      confirmPassword: "Password456",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.path.includes("confirmPassword") &&
            issue.message === "Passwords do not match.",
        ),
      ).toBe(true);
    }
  });
});