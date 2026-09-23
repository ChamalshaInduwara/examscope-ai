"use server";

import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  documentMetadataSchema,
  getFileExtension,
  validateDocumentFile,
} from "@/lib/validations/document";
import { s3, S3_BUCKET_NAME } from "@/lib/storage/s3";

export type UploadDocumentState = {
  success?: boolean;
  message?: string;

  errors?: {
    subjectId?: string[];
    title?: string[];
    documentType?: string[];
    year?: string[];
    description?: string[];
    file?: string[];
  };
};

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function uploadDocument(
  _previousState: UploadDocumentState,
  formData: FormData,
): Promise<UploadDocumentState> {
  const user = await requireUser();

  const metadataResult = documentMetadataSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    documentType: formData.get("documentType"),
    year: formData.get("year") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!metadataResult.success) {
    return {
      success: false,
      message: "Please check the document details.",
      errors: metadataResult.error.flatten().fieldErrors,
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false,
      message: "Please select a valid file.",
      errors: {
        file: ["Please select a file."],
      },
    };
  }

  const fileError = validateDocumentFile(file);

  if (fileError) {
    return {
      success: false,
      message: "The selected file cannot be uploaded.",
      errors: {
        file: [fileError],
      },
    };
  }

  const subject = await prisma.subject.findFirst({
    where: {
      id: metadataResult.data.subjectId,
      userId: user.id,
      archived: false,
    },

    select: {
      id: true,
    },
  });

  if (!subject) {
    return {
      success: false,
      message:
        "The selected subject does not exist or you do not have permission to use it.",
      errors: {
        subjectId: ["Invalid subject."],
      },
    };
  }

  const extension = getFileExtension(file.name);
  const safeFileName = sanitizeFileName(file.name);

  const storageKey = [
    "users",
    user.id,
    "subjects",
    subject.id,
    "documents",
    `${randomUUID()}-${safeFileName}`,
  ].join("/");

  let uploadedToStorage = false;

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: storageKey,
        Body: fileBuffer,
        ContentType: file.type || "application/octet-stream",

        Metadata: {
          originalfilename: safeFileName,
          userid: user.id,
          subjectid: subject.id,
        },
      }),
    );

    uploadedToStorage = true;

    const document = await prisma.document.create({
      data: {
        title: metadataResult.data.title,
        fileName: file.name,
        fileType: extension,
        mimeType: file.type || null,
        fileSize: file.size,

        documentType: metadataResult.data.documentType,
        year: metadataResult.data.year,
        description: metadataResult.data.description,

        storageKey,

        processingStatus: "PENDING",

        subjectId: subject.id,
      },

      select: {
        id: true,
      },
    });

    revalidatePath("/uploads");
    revalidatePath(`/subjects/${subject.id}`);

    return {
      success: true,
      message: `Document uploaded successfully. Processing is pending. Document ID: ${document.id}`,
    };
  } catch (error) {
    console.error("Document upload failed:", error);

    if (uploadedToStorage) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: storageKey,
          }),
        );
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded object:", cleanupError);
      }
    }

    return {
      success: false,
      message: "Unable to upload the document. Please try again.",
    };
  }
}

export async function deleteDocument(formData: FormData) {
  const user = await requireUser();

  const documentId = formData.get("documentId");

  if (typeof documentId !== "string" || !documentId) {
    return;
  }

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,

      subject: {
        userId: user.id,
      },
    },

    select: {
      id: true,
      storageKey: true,
      subjectId: true,
    },
  });

  if (!document) {
    return;
  }

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: document.storageKey,
      }),
    );

    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    revalidatePath("/uploads");
    revalidatePath(`/subjects/${document.subjectId}`);
  } catch (error) {
    console.error("Delete document failed:", error);
  }
}
