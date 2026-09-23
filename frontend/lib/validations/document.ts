import { z } from "zod";

export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "docx",
  "pptx",
  "txt",
] as const;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

export const documentMetadataSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject."),

  title: z
    .string()
    .trim()
    .min(2, "Document title must contain at least 2 characters.")
    .max(150, "Document title is too long."),

  documentType: z.enum([
    "PAST_PAPER",
    "LECTURE_NOTE",
    "MODULE_CONTENT",
    "TEXTBOOK",
    "OTHER",
  ]),

  year: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      return Number(value);
    })
    .refine(
      (value) =>
        value === undefined ||
        (Number.isInteger(value) && value >= 1900 && value <= 2100),
      "Please enter a valid year."
    ),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long.")
    .optional(),
});

export function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function validateDocumentFile(file: File) {
  if (!file || file.size === 0) {
    return "Please select a file.";
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return "File size must not exceed 20 MB.";
  }

  const extension = getFileExtension(file.name);

  if (
    !ALLOWED_FILE_EXTENSIONS.includes(
      extension as (typeof ALLOWED_FILE_EXTENSIONS)[number]
    )
  ) {
    return "Only PDF, DOCX, PPTX and TXT files are allowed.";
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return "The selected file type is not supported.";
  }

  return null;
}