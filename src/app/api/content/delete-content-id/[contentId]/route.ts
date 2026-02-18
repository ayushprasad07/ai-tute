import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ contentId: string }> }
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

  try {
    const { contentId } = await params;

    const content = await Content.findOne({
      _id: new mongoose.Types.ObjectId(contentId),
      userId,
    });

    if (!content) {
      return Response.json(
        { success: false, message: "Content not found" },
        { status: 404 }
      );
    }

    // ✅ Delete file from Supabase
    if (content.sourceUrl) {
      const url = new URL(content.sourceUrl);

      // pathname example:
      // /storage/v1/object/public/pdfs/file.pdf

      const filePath = decodeURIComponent(
        url.pathname.split("/pdfs/")[1]
      );

      console.log("Deleting file:", filePath);

      const { error } = await supabase.storage
        .from("pdfs")
        .remove([filePath]);

      if (error) {
        console.error("Supabase delete error:", error);
      }
    }

    // ✅ Delete MongoDB document
    await Content.deleteOne({
      _id: new mongoose.Types.ObjectId(contentId),
    });

    return Response.json(
      {
        success: true,
        message: "Content and PDF deleted successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
