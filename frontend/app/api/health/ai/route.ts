import { NextResponse } from "next/server";

import { getFastApiHealth } from "@/lib/api/fastapi";

export async function GET() {
  try {
    await getFastApiHealth();

    return NextResponse.json({
      status: "ok",
      aiService: "connected",
    });
  } catch (error) {
    console.error(
      "FastAPI health check failed:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        aiService: "disconnected",
      },
      {
        status: 503,
      }
    );
  }
}