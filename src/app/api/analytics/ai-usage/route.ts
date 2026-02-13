import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import Chat from "@/models/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";

// /api/analytics/ai-usage

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
    const summariesGenerated = await Content.countDocuments({
      userId,
      status: "ready",
    });

    const chatStats = await Chat.aggregate([
      {
        $lookup: {
          from: "contents",
          localField: "contentId",
          foreignField: "_id",
          as: "content",
        },
      },
      { $unwind: "$content" },
      {
        $match: {
          "content.userId": userId,
        },
      },
      {
        $project: {
          totalMessages: { $size: "$messages" },
          userMessages: {
            $size: {
              $filter: {
                input: "$messages",
                as: "msg",
                cond: { $eq: ["$$msg.role", "user"] },
              },
            },
          },
          assistantMessages: {
            $size: {
              $filter: {
                input: "$messages",
                as: "msg",
                cond: { $eq: ["$$msg.role", "assistant"] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: "$totalMessages" },
          userMessages: { $sum: "$userMessages" },
          assistantMessages: { $sum: "$assistantMessages" },
        },
      },
    ]);

    const usage = chatStats[0] || {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
    };

    return Response.json(
      {
        success: true,
        aiUsage: {
          summariesGenerated,
          totalMessages: usage.totalMessages,
          userMessages: usage.userMessages,
          assistantMessages: usage.assistantMessages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("AI usage analytics error:", error);

    return Response.json(
      { success: false, message: "Failed to fetch AI usage analytics" },
      { status: 500 }
    );
  }
}
