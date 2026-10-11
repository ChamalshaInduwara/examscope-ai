import { describe, expect, it } from "vitest";

import {
  documentMetadataSchema,
  getFileExtension,
  MAX_UPLOAD_SIZE,
  validateDocumentFile,
} from "@/lib/validations/document";

describe("getFileExtension", () => {
  it("returns a lowercase file extension", () => {
    expect(getFileExtension("paper.PDF")).toBe("pdf");
  });

  it("returns the last extension for filenames with multiple dots", () => {
    expect(getFileExtension("exam.paper.final.docx")).toBe("docx");
  });

  it("returns an empty string when no extension exists", () => {
    expect(getFileExtension("document")).toBe("");
  });
});

describe("documentMetadataSchema", () => {
  it("accepts valid document metadata", () => {
    const result = documentMetadataSchema.safeParse({
      subjectId: "subject-1",
      title: "2025 Biology Past Paper",
      documentType: "PAST_PAPER",
      year: "2025",
      description: "Biology past paper.",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.year).toBe(2025);
    }
  });

  it("trims the document title and description", () => {
    const result = documentMetadataSchema.safeParse({
      subjectId: "subject-1",
      title: "  Biology Notes  ",
      documentType: "LECTURE_NOTE",
      description: "  Cell biology notes.  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Biology Notes");
      expect(result.data.description).toBe("Cell biology notes.");
    }
  });

  it("rejects an empty subject id", () => {
    const result = documentMetadataSchema.safeParse({
      subjectId: "",
      title: "Biology Notes",
      documentType: "LECTURE_NOTE",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid document year", () => {
    const result = documentMetadataSchema.safeParse({
      subjectId: "subject-1",
      title: "Biology Notes",
      documentType: "LECTURE_NOTE",
      year: "1800",
    });

    expect(result.success).toBe(false);
  });

  it("converts an empty year to undefined", () => {
    const result = documentMetadataSchema.safeParse({
      subjectId: "subject-1",
      title: "Biology Notes",
      documentType: "LECTURE_NOTE",
      year: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.year).toBeUndefined();
    }
  });
});

describe("validateDocumentFile", () => {
  it("accepts a valid PDF file", () => {
    const file = new File(
      ["test"],
      "paper.pdf",
      { type: "application/pdf" },
    );

    expect(validateDocumentFile(file)).toBeNull();
  });

  it("rejects an unsupported file extension", () => {
    const file = new File(
      ["test"],
      "image.jpg",
      { type: "image/jpeg" },
    );

    expect(validateDocumentFile(file)).toBe(
      "Only PDF, DOCX, PPTX and TXT files are allowed.",
    );
  });

  it("rejects a mismatched file extension and MIME type", () => {
    const file = new File(
      ["test"],
      "paper.pdf",
      { type: "text/plain" },
    );

    expect(validateDocumentFile(file)).toBe(
      "The file extension does not match the detected file type.",
    );
  });

  it("rejects an empty file", () => {
    const file = new File(
      [],
      "paper.pdf",
      { type: "application/pdf" },
    );

    expect(validateDocumentFile(file)).toBe(
      "Please select a file.",
    );
  });

  it("rejects a file larger than 20 MB", () => {
    const oversizedContent = new Uint8Array(MAX_UPLOAD_SIZE + 1);

    const file = new File(
      [oversizedContent],
      "paper.pdf",
      { type: "application/pdf" },
    );

    expect(validateDocumentFile(file)).toBe(
      "File size must not exceed 20 MB.",
    );
  });
});