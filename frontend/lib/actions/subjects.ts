"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { subjectSchema } from "@/lib/validations/subject";

export type CreateSubjectState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    code?: string[];
    educationLevel?: string[];
    institution?: string[];
    examType?: string[];
    description?: string[];
  };
};

export async function createSubject(
  _previousState: CreateSubjectState,
  formData: FormData
): Promise<CreateSubjectState> {
  const user = await requireUser();

  const result = subjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    educationLevel: formData.get("educationLevel") || undefined,
    institution: formData.get("institution") || undefined,
    examType: formData.get("examType") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!result.success) {
    return {
      success: false,
      message: "Please check the subject details.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.subject.create({
      data: {
        ...result.data,

        userId: user.id,
      },
    });

    revalidatePath("/subjects");

    return {
      success: true,
      message: "Subject created successfully.",
    };
  } catch (error) {
    console.error("Create subject failed:", error);

    return {
      success: false,
      message: "Unable to create the subject. Please try again.",
    };
  }
}
export type UpdateSubjectState = {
  message?: string;
  errors?: {
    name?: string[];
    code?: string[];
    educationLevel?: string[];
    institution?: string[];
    examType?: string[];
    description?: string[];
  };
};

export async function updateSubject(
  _previousState: UpdateSubjectState,
  formData: FormData
): Promise<UpdateSubjectState> {
  const user = await requireUser();

  const subjectId = formData.get("subjectId");

  if (typeof subjectId !== "string" || !subjectId) {
    return {
      message: "Invalid subject.",
    };
  }

  const result = subjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    educationLevel: formData.get("educationLevel") || undefined,
    institution: formData.get("institution") || undefined,
    examType: formData.get("examType") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!result.success) {
    return {
      message: "Please check the subject details.",
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const updated = await prisma.subject.updateMany({
      where: {
        id: subjectId,
        userId: user.id,
        archived: false,
      },

      data: result.data,
    });

    if (updated.count === 0) {
      return {
        message: "Subject not found or you do not have permission to edit it.",
      };
    }
  } catch (error) {
    console.error("Update subject failed:", error);

    return {
      message: "Unable to update the subject. Please try again.",
    };
  }

  revalidatePath("/subjects");
  revalidatePath(`/subjects/${subjectId}`);

  redirect(`/subjects/${subjectId}`);
}

export async function archiveSubject(formData: FormData) {
  const user = await requireUser();

  const subjectId = formData.get("subjectId");

  if (typeof subjectId !== "string" || !subjectId) {
    return;
  }

  const result = await prisma.subject.updateMany({
    where: {
      id: subjectId,
      userId: user.id,
      archived: false,
    },

    data: {
      archived: true,
    },
  });

  if (result.count === 0) {
    return;
  }

  revalidatePath("/subjects");

  redirect("/subjects");
}