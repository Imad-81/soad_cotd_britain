import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return NextResponse.json({ success: true, themes });
  } catch (error) {
    console.error("Failed to fetch themes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch themes" },
      { status: 500 }
    );
  }
}
