// app/api/content/fetch-content-by-id/[contentId]/route.ts

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { protectRoute } from "@/lib/protectRoute";

export async function GET(
  req: Request,
  { params }: {params : Promise<{contentId : string}>} 
) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user._id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user._id;
  const { contentId } = await params;

  try {
    
    const blocked = await protectRoute({
            action: "fetch-all",
            req,
            userLimit: 30,   // user can fetch 30 times/min
            ipLimit: 60,     // IP can fetch 60 times/min
            window: 60
        });

    if (blocked) return blocked;
    if (!contentId) {
      return Response.json(
        { success: false, message: "Please provide content" },
        { status: 400 }
      );
    }

    const content = await Content.findOne({
      _id: new mongoose.Types.ObjectId(contentId),
      userId,
    }).lean(); // Use lean() for better performance

    if (!content) {
      return Response.json(
        { success: true, content : {} },
        { status: 200 }
      );
    }

    // Transform MongoDB document to plain object
    const transformedContent = {
      _id: content._id.toString(),
      title: content.title,
      type: content.type,
      status: content.status,
      sourceUrl: content.sourceUrl,
      url: content.type === "youtube" 
        ? extractVideoId(content.sourceUrl) 
        : content.sourceUrl?.split("/")?.[3] ?? "",
      summary: content.content,
      content: content.content, // Keep both for backward compatibility
      repoFiles: content.repoFiles?.map((file: any) => ({
        path: file.path,
        size: file.size,
        type: file.type
      })) || [],
      repoGraph: content.repoGraph ? {
        nodes: content.repoGraph.nodes?.map((node: any) => ({
          id: node.id,
          label: node.label,
          folder: node.folder || (node.id.startsWith('folder-') ? node.label : 'root')
        })) || [],
        edges: content.repoGraph.edges?.map((edge: any) => ({
          source: edge.source,
          target: edge.target
        })) || []
      } : null,
      fileUrl: content.fileUrl,
      fileKey: content.fileKey,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    };

    return Response.json(
      {
        success: true,
        content: transformedContent
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string {
  if (!url) return "";
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([0-9A-Za-z_-]{11})/);
  return match?.[1] ?? "";
}