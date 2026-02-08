import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Content from "@/models/Content";
import fs from "fs-extra";
import path from "path";
import { writeFile } from "fs/promises";

export const maxDuration = 60; // 60 seconds timeout for file upload

const uploadDir = path.join(process.cwd(), "public/uploads/pdfs");

// Ensure upload directory exists
fs.ensureDirSync(uploadDir);

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user._id) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    // Parse the form data
    const formData = await req.formData();
    const fileEntry = formData.get("pdf");
    const titleEntry = formData.get("title");

    // Validate title
    if (!titleEntry || typeof titleEntry !== "string") {
      return Response.json(
        {
          success: false,
          message: "No file uploaded or title provided",
        },
        {
          status: 400,
        }
      );
    }
    const title = titleEntry as string;

    // Validate file
    if (!fileEntry || typeof fileEntry === "string") {
      return Response.json(
        {
          success: false,
          message: "No file uploaded or title provided",
        },
        {
          status: 400,
        }
      );
    }
    const file = fileEntry as File;

    // Validate file type
    if (file.type !== "application/pdf") {
      return Response.json(
        {
          success: false,
          message: "Invalid file type. Please upload a PDF file.",
        },
        {
          status: 400,
        }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return Response.json(
        {
          success: false,
          message: "File too large. Maximum size is 10MB.",
        },
        {
          status: 400,
        }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}${extension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativePath = `/uploads/pdfs/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create content record in database
    const content = await Content.create({
      userId: session.user._id,
      type: "pdf",
      title: title,
      sourceUrl: relativePath,
      status: "processing",
    });

    return Response.json(
      {
        success: true,
        message: "PDF uploaded successfully",
        content: {
          _id: content._id,
          title: content.title,
          type: content.type,
          sourceUrl: content.sourceUrl,
          status: content.status,
          createdAt: content.createdAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Internal server error:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}