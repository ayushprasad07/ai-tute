import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { title } from "process";

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
    if (!contentId) {
      return Response.json(
        { success: false, message: "Please provide content" },
        { status: 400 }
      );
    }

    const content = await Content.findOne({
      _id: new mongoose.Types.ObjectId(contentId),
      userId,
    });

    if (!content) {
      return Response.json(
        { success: true, content :{} },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        content:{
            title : content.title,
            url:
              content.type === "youtube"
                ? extractVideoId(content.sourceUrl)
                : content.sourceUrl?.split("/")?.[3] ?? "",
            summary : content.content,
            status : content.status,
            type : content.type
        }
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

  const match = url.match(
    /(?:v=|youtu\.be\/|embed\/)([0-9A-Za-z_-]{11})/
  );

  return match?.[1] ?? "";
}

