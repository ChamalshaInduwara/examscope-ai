import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(100, "Name is too long."),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password is too long.")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter.",
      )
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter.",
      )
      .regex(
        /[0-9]/,
        "Password must contain at least one number.",
      ),

    confirmPassword: z
      .string()
      .max(128, "Password confirmation is too long."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;