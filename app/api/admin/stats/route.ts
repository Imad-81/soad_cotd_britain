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
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const [
      totalSubmissions,
      pendingCount,
      reviewedCount,
      shortlistedCount,
      winnerCount,
      config,
      ratingsAgg,
    ] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "PENDING" } }),
      prisma.submission.count({ where: { status: "REVIEWED" } }),
      prisma.submission.count({ where: { status: "SHORTLISTED" } }),
      prisma.submission.count({ where: { status: "WINNER" } }),
      prisma.competitionConfig.findUnique({ where: { id: "global" } }),
      prisma.submission.aggregate({
        _avg: { rating: true },
        where: { rating: { not: null } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalSubmissions,
        pendingCount,
        reviewedCount,
        shortlistedCount,
        winnerCount,
        avgRating: ratingsAgg._avg.rating ? Number(ratingsAgg._avg.rating.toFixed(1)) : null,
        areResultsPublished: config?.areResultsPublished || false,
        publishedAt: config?.publishedAt || null,
        resultsAnnouncement: config?.resultsAnnouncement || "",
      },
    });
  } catch (error) {
    if ((error as { digest?: string })?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
