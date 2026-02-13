import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";

// /api/analytics/content-trend
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
    const trend = await Content.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
    ]);

    return Response.json(
      {
        success: true,
        trend,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Content trend analytics error:", error);

    return Response.json(
      { success: false, message: "Failed to fetch trend analytics" },
      { status: 500 }
    );
  }
}
