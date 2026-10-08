import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { areResultsPublished, resultsAnnouncement } = body;

    const updated = await prisma.competitionConfig.upsert({
      where: { id: "global" },
      update: {
        areResultsPublished: Boolean(areResultsPublished),
        publishedAt: areResultsPublished ? new Date() : null,
        resultsAnnouncement: resultsAnnouncement || undefined,
      },
      create: {
        id: "global",
        areResultsPublished: Boolean(areResultsPublished),
        publishedAt: areResultsPublished ? new Date() : null,
        resultsAnnouncement: resultsAnnouncement || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: updated.areResultsPublished
        ? "Competition results have been published to the public!"
        : "Competition results have been unpublished.",
      config: updated,
    });
  } catch (error) {
    console.error("Admin publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update publication status." },
      { status: 500 }
    );
  }
}
