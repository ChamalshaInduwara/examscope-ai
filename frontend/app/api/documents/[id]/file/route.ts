import {
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import {
  s3,
  S3_BUCKET_NAME,
} from "@/lib/storage/s3";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        message: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await context.params;

  const document = await prisma.document.findFirst({
    where: {
      id,

      subject: {
        userId: session.user.id,
        archived: false,
      },
    },

    select: {
      id: true,
      fileName: true,
      mimeType: true,
      storageKey: true,
    },
  });

  if (!document) {
    return NextResponse.json(
      {
        message: "Document not found.",
      },
      {
        status: 404,
      }
    );
  }

  const url = new URL(request.url);

  const mode =
    url.searchParams.get("mode") === "download"
      ? "download"
      : "view";

  const encodedFileName = encodeURIComponent(
    document.fileName
  );

  const contentDisposition =
    mode === "download"
      ? `attachment; filename*=UTF-8''${encodedFileName}`
      : `inline; filename*=UTF-8''${encodedFileName}`;

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: document.storageKey,

    ResponseContentDisposition:
      contentDisposition,

    ...(document.mimeType
      ? {
          ResponseContentType:
            document.mimeType,
        }
      : {}),
  });

  const signedUrl = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 60,
    }
  );

  return NextResponse.redirect(
    signedUrl,
    307
  );
}