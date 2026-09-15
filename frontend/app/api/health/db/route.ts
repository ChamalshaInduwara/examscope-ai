import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
      },
      {
        status: 500,
      }
    );
  }
}