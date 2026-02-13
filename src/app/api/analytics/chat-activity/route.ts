import dbConnect from "@/lib/dbConnect";
import Chat from "@/models/Chat";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";

// /api/analytics/chat-activity

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?._id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(session.user._id);

  try {
    const activity = await Chat.aggregate([
      {
        $lookup: {
          from: "contents",
          localField: "contentId",
          foreignField: "_id",
          as: "content",
        },
      },
      {
        $unwind: "$content",
      },
      {
        $match: {
          "content.userId": userId,
        },
      },
      {
        $project: {
          contentId: 1,
          title: "$content.title",
          messages: { $size: "$messages" },
        },
      },
      {
        $sort: {
          messages: -1,
        },
      },
    ]);

    return Response.json(
      {
        success: true,
        activity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Chat activity analytics error:", error);

    return Response.json(
      { success: false, message: "Failed to fetch chat analytics" },
      { status: 500 }
    );
  }
}
