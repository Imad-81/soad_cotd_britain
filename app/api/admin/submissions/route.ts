import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Admin privilege required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const themeId = searchParams.get("themeId");
    const status = searchParams.get("status");

    const where: { themeId?: string; status?: string } = {};
    if (themeId && themeId !== "all") {
      where.themeId = themeId;
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const submissions = await prisma.submission.findMany({
      where,
      select: {
        id: true,
        themeId: true,
        userId: true,
        participantName: true,
        participantEmail: true,
        title: true,
        description: true,
        originalFilename: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        rating: true,
        feedback: true,
        status: true,
        award: true,
        createdAt: true,
        updatedAt: true,
        theme: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            slug: true,
            imagePath: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Admin submissions fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin submissions" },
      { status: 500 }
    );
  }
}
