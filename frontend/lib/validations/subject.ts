import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must contain at least 2 characters.")
    .max(100, "Subject name is too long."),

  code: z
    .string()
    .trim()
    .max(30, "Subject code is too long.")
    .optional(),

  educationLevel: z
    .string()
    .trim()
    .max(100, "Education level is too long.")
    .optional(),

  institution: z
    .string()
    .trim()
    .max(150, "Institution name is too long.")
    .optional(),

  examType: z
    .string()
    .trim()
    .max(100, "Exam type is too long.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .optional(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;