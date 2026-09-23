import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

import {
  s3,
  S3_BUCKET_NAME,
} from "@/lib/storage/s3";

export async function GET() {
  try {
    await s3.send(
      new HeadBucketCommand({
        Bucket: S3_BUCKET_NAME,
      })
    );

    return NextResponse.json({
      status: "ok",
      storage: "connected",
      bucket: S3_BUCKET_NAME,
    });
  } catch (error) {
    console.error("Storage health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        storage: "disconnected",
      },
      {
        status: 500,
      }
    );
  }
}