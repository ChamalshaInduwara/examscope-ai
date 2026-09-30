"use server";

import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  documentMetadataSchema,
  getFileExtension,
  validateDocumentFile,
} from "@/lib/validations/document";
import { s3, S3_BUCKET_NAME } from "@/lib/storage/s3";
import {
  analyzeQuestionsWithFastApi,
  discoverTopicsWithFastApi,
  FastApiError,
  processDocumentWithFastApi,
} from "@/lib/api/fastapi";

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

function mapQuestionType(
  type:
    | "mcq"
    | "structured"
    | "essay"
    | "calculation"
    | "short_answer"
    | "unknown"
    | undefined,
): "MCQ" | "STRUCTURED" | "ESSAY" {
  switch (type) {
    case "mcq":
      return "MCQ";

    case "essay":
      return "ESSAY";

    default:
      return "STRUCTURED";
  }
}

function normalizeQuestionText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export async function processDocument(formData: FormData) {
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
        archived: false,
      },
    },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      storageKey: true,
      year: true,
      subjectId: true,
      processingStatus: true,
    },
  });

  if (!document) {
    return;
  }

  if (document.processingStatus === "PROCESSING") {
    return;
  }

  await prisma.document.update({
    where: {
      id: document.id,
    },

    data: {
      processingStatus: "PROCESSING",
      processingError: null,
    },
  });

  revalidatePath("/uploads");
  revalidatePath(`/subjects/${document.subjectId}`);

  try {
    const storedObject = await s3.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: document.storageKey,
      }),
    );

    if (!storedObject.Body) {
      throw new Error("Stored document could not be read.");
    }

    const bytes = await storedObject.Body.transformToByteArray();

    const blob = new Blob([new Uint8Array(bytes)], {
      type: document.mimeType || "application/octet-stream",
    });

    // Stage 1:
    // extraction + cleaning + chunking
    const processingResult = await processDocumentWithFastApi({
      file: blob,
      fileName: document.fileName,
    });

    // Stage 2:
    // structured question analysis
    const questionResult = await analyzeQuestionsWithFastApi({
      file: blob,
      fileName: document.fileName,
      year: document.year,
    });

    // Stage 3:
    // topic discovery + question-topic mapping
    const topicResult = await discoverTopicsWithFastApi({
      file: blob,
      fileName: document.fileName,
      maxTopics: 10,
    });

    await prisma.$transaction(
      async (tx) => {
        const previousTopicLinks = await tx.documentTopic.findMany({
          where: {
            documentId: document.id,
          },

          select: {
            topicId: true,
          },
        });

        const previousTopicIds = previousTopicLinks.map((link) => link.topicId);

        // Existing predictions are based on the previous document intelligence.
        // They must be regenerated after reprocessing.
        await tx.prediction.deleteMany({
          where: {
            subjectId: document.subjectId,
          },
        });

        // Remove previous document-specific results.
        // This makes reprocessing idempotent.
        await tx.question.deleteMany({
          where: {
            documentId: document.id,
          },
        });

        await tx.documentTopic.deleteMany({
          where: {
            documentId: document.id,
          },
        });

        const topicIdMap = new Map<string, string>();

        // Upsert subject-level topics.
        for (const discoveredTopic of topicResult.topics) {
          const topicName = discoveredTopic.name.trim();

          if (!topicName) {
            continue;
          }

          const topic = await tx.topic.upsert({
            where: {
              subjectId_name: {
                subjectId: document.subjectId,
                name: topicName,
              },
            },

            update: {},

            create: {
              name: topicName,
              subjectId: document.subjectId,
            },

            select: {
              id: true,
            },
          });

          topicIdMap.set(discoveredTopic.topic_id, topic.id);

          await tx.documentTopic.create({
            data: {
              documentId: document.id,
              topicId: topic.id,
              confidence: discoveredTopic.score,
            },
          });
        }

        // Save structured questions.
        for (const question of questionResult.questions) {
          const normalizedQuestion = normalizeQuestionText(question.text);

          const topicMapping = topicResult.question_mappings.find(
            (mapping) =>
              normalizeQuestionText(mapping.question_text) ===
              normalizedQuestion,
          );

          const topicId = topicMapping
            ? (topicIdMap.get(topicMapping.topic_id) ?? null)
            : null;

          await tx.question.create({
            data: {
              text: question.text,

              type: mapQuestionType(question.question_type),

              marks: question.marks ?? null,

              year: questionResult.year ?? document.year ?? null,

              number: question.question_number ?? null,

              subjectId: document.subjectId,

              documentId: document.id,

              topicId,
            },
          });
        }

        if (previousTopicIds.length > 0) {
          await tx.topic.deleteMany({
            where: {
              id: {
                in: previousTopicIds,
              },

              subjectId: document.subjectId,

              documents: {
                none: {},
              },

              questions: {
                none: {},
              },

              predictions: {
                none: {},
              },

              generatedQuestions: {
                none: {},
              },
            },
          });
        }

        await tx.document.update({
          where: {
            id: document.id,
          },

          data: {
            processingStatus: "COMPLETED",
            processingError: null,
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 20000,
      },
    );

    console.log("Document intelligence completed:", {
      documentId: document.id,

      segments: processingResult.cleaning.total_segments,

      chunks: processingResult.chunking.total_chunks,

      questionBlocks: processingResult.question_blocks.total_blocks,

      questions: questionResult.total_questions,

      topics: topicResult.total_topics,
    });
  } catch (error) {
    console.error("Document intelligence failed:", error);

    let message = "Document processing failed.";

    if (error instanceof FastApiError) {
      message = error.detail
        ? `${error.message} ${error.detail}`
        : error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    await prisma.document.update({
      where: {
        id: document.id,
      },

      data: {
        processingStatus: "FAILED",
        processingError: message.slice(0, 1000),
      },
    });
  }

  revalidatePath("/uploads");
  revalidatePath(`/subjects/${document.subjectId}`);
}
