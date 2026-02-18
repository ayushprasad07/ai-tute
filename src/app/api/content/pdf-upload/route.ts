import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import Content from "@/models/Content";
import { authOptions } from "../../auth/[...nextauth]/options";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user?._id) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();

    const file = formData.get("pdf");
    const contentId = formData.get("contentId") as string;

    // ✅ Validate contentId
    if (!contentId) {
      return Response.json(
        { success: false, message: "contentId required" },
        { status: 400 }
      );
    }

    // ✅ Validate file properly
    if (!(file instanceof Blob)) {
      return Response.json(
        { success: false, message: "Invalid file upload" },
        { status: 400 }
      );
    }

    const content = await Content.findOne({
      _id: contentId, // ✅ no ObjectId casting needed
      userId: session.user._id,
    });

    if (!content) {
      return Response.json(
        { success: false, message: "Unauthorized content" },
        { status: 404 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${(file as File).name}`;

    const {error} = await supabase.storage
      .from("pdfs")
      .upload(fileName, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType : "application/pdf",
      });

    if (error) {
      console.log(error);
      return Response.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }

    const {data} = supabase.storage
      .from("pdfs")
      .getPublicUrl(fileName);

    const pdfUrl = data.publicUrl;

    content.sourceUrl = pdfUrl;
    content.status = "processing";

    await content.save();

    return Response.json({
      success: true,
      message: "PDF uploaded successfully",
      content,
    });
  } catch (error) {
    console.log("Upload error:", error);

    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
