import { describe, expect, it } from "vitest";

import { subjectSchema } from "@/lib/validations/subject";

describe("subjectSchema", () => {
  it("accepts valid subject data", () => {
    const result = subjectSchema.safeParse({
      name: "Machine Learning",
      code: "5COSC019",
      educationLevel: "Undergraduate",
      institution: "IIT Sri Lanka",
      examType: "Coursework",
      description: "Machine learning module.",
    });

    expect(result.success).toBe(true);
  });

  it("trims text fields", () => {
    const result = subjectSchema.safeParse({
      name: "  Machine Learning  ",
      code: "  5COSC019  ",
      educationLevel: "  Undergraduate  ",
      institution: "  IIT Sri Lanka  ",
      examType: "  Coursework  ",
      description: "  Machine learning module.  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Machine Learning");
      expect(result.data.code).toBe("5COSC019");
      expect(result.data.educationLevel).toBe("Undergraduate");
      expect(result.data.institution).toBe("IIT Sri Lanka");
      expect(result.data.examType).toBe("Coursework");
      expect(result.data.description).toBe("Machine learning module.");
    }
  });

  it("rejects a subject name shorter than 2 characters", () => {
    const result = subjectSchema.safeParse({
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a subject name longer than 100 characters", () => {
    const result = subjectSchema.safeParse({
      name: "A".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("accepts optional fields when omitted", () => {
    const result = subjectSchema.safeParse({
      name: "Database Systems",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a subject code longer than 30 characters", () => {
    const result = subjectSchema.safeParse({
      name: "Database Systems",
      code: "A".repeat(31),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an education level longer than 100 characters", () => {
    const result = subjectSchema.safeParse({
      name: "Database Systems",
      educationLevel: "A".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description longer than 1000 characters", () => {
    const result = subjectSchema.safeParse({
      name: "Database Systems",
      description: "A".repeat(1001),
    });

    expect(result.success).toBe(false);
  });
});