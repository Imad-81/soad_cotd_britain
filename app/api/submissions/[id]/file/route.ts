import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("File ID required", { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: {
        fileData: true,
        mimeType: true,
        originalFilename: true,
        fileUrl: true,
      },
    });

    if (!submission) {
      return new NextResponse("File not found", { status: 404 });
    }

    // 1. Serve from database bytes (Vercel & cloud compatible)
    if (submission.fileData) {
      const buffer = Buffer.from(submission.fileData);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": submission.mimeType || "image/jpeg",
          "Content-Disposition": `inline; filename="${encodeURIComponent(
            submission.originalFilename
          )}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Fallback to local disk if previous upload was stored locally
    if (submission.fileUrl && submission.fileUrl.startsWith("/uploads/")) {
      try {
        const localPath = path.join(process.cwd(), "public", submission.fileUrl);
        const fileBuffer = await fs.readFile(localPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": submission.mimeType || "image/jpeg",
            "Content-Disposition": `inline; filename="${encodeURIComponent(
              submission.originalFilename
            )}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        // File not on local disk
      }
    }

    return new NextResponse("File not found", { status: 404 });
  } catch (error) {
    console.error("Error serving submission file:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
