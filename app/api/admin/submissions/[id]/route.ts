import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { rating, feedback, status, award } = body;

    const data: {
      rating?: number | null;
      feedback?: string;
      status?: string;
      award?: string | null;
    } = {};
    if (rating !== undefined) {
      data.rating = rating === null || rating === "" ? null : parseFloat(rating);
    }
    if (feedback !== undefined) {
      data.feedback = feedback;
    }
    if (status !== undefined) {
      data.status = status;
    }
    if (award !== undefined) {
      data.award = award === "" ? null : award;
    }

    const updated = await prisma.submission.update({
      where: { id },
      data,
      include: {
        theme: true,
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error("Admin update submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const existing = await prisma.submission.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    // Try to remove file from disk if present
    if (existing.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", existing.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch {
        // file might already be removed
      }
    }

    await prisma.submission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Submission deleted." });
  } catch (error) {
    console.error("Admin delete submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
