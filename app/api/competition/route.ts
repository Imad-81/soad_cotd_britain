import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const config = await prisma.competitionConfig.findUnique({
      where: { id: "global" },
    });

    let publishedResults: any[] = [];
    if (config?.areResultsPublished) {
      publishedResults = await prisma.submission.findMany({
        where: {
          status: { in: ["WINNER", "SHORTLISTED", "REVIEWED"] },
          rating: { not: null },
        },
        orderBy: [{ rating: "desc" }, { createdAt: "asc" }],
        include: {
          theme: {
            select: {
              title: true,
              subtitle: true,
              slug: true,
              imagePath: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: config || {
        areResultsPublished: false,
        title: "Crown of the Realm: British Heritage & Creative Challenge",
        subtitle: "Reimagine Britain's Historic Interiors",
      },
      publishedResults,
    });
  } catch (error) {
    console.error("Failed to fetch competition status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch competition status" },
      { status: 500 }
    );
  }
}
