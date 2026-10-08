import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: true, submissions: [] });
    }

    const submissions = await prisma.submission.findMany({
      where: { userId: session.user.id },
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
            title: true,
            subtitle: true,
            slug: true,
            imagePath: true,
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
    console.error("Error fetching user submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be signed in to submit an entry." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const themeId = formData.get("themeId") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const participantName =
      (formData.get("participantName") as string)?.trim() || session.user.name;
    const participantEmail =
      (formData.get("participantEmail") as string)?.trim() || session.user.email;
    const file = formData.get("file") as File | null;

    if (!themeId || !title || !file) {
      return NextResponse.json(
        {
          success: false,
          error: "Theme selection, entry title, and artwork file are required.",
        },
        { status: 400 }
      );
    }

    // Verify theme exists
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      return NextResponse.json(
        { success: false, error: "Selected theme does not exist." },
        { status: 404 }
      );
    }

    // File handling with duplicate collision prevention
    const originalName = file.name || "submission.jpg";
    const extension = path.extname(originalName).toLowerCase() || ".jpg";
    const sanitizedBase = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 32);

    // Guaranteed unique prefix: timestamp + cryptographic random hex
    const uniquePrefix = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const storedFileName = `${uniquePrefix}_${sanitizedBase}${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Create submission with fileData stored directly in Neon PostgreSQL
    const submission = await prisma.submission.create({
      data: {
        themeId: theme.id,
        userId: session.user.id,
        participantName,
        participantEmail,
        title,
        description,
        originalFilename: originalName,
        fileUrl: "", // Updated below with permanent API URL
        fileData: buffer,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        status: "PENDING",
      },
      include: {
        theme: true,
      },
    });

    const fileUrl = `/api/submissions/${submission.id}/file`;
    await prisma.submission.update({
      where: { id: submission.id },
      data: { fileUrl },
    });
    submission.fileUrl = fileUrl;

    // 2. Best-effort local file write (works locally; safely skipped on Vercel's read-only filesystem)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const destinationPath = path.join(uploadDir, storedFileName);
      await fs.writeFile(destinationPath, buffer);
    } catch {
      // EROFS in serverless environments is expected and safely ignored
    }

    const safeSubmission = {
      ...submission,
      fileData: undefined,
    };

    return NextResponse.json({
      success: true,
      message: "Submission received successfully!",
      submission: safeSubmission,
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process submission." },
      { status: 500 }
    );
  }
}
