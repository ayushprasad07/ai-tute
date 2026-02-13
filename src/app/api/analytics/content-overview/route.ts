import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";

// /api/analytics/content-overview
export async function POST(req : Request){
    await dbConnect();

    const session = await getServerSession(authOptions);

    if(!session || !session.user._id){
        return Response.json({
            success : false,
            message : "Unauthorized"
        },{
            status : 401
        })
    }

    const userId = session.user._id;

    try {
        
        const [
            totalContents,
            totalPDF,
            totalYouTube,
            processing,
            ready,
            failed,
            ] = await Promise.all([
            Content.countDocuments({ userId }),
            Content.countDocuments({ userId, type: "pdf" }),
            Content.countDocuments({ userId, type: "youtube" }),
            Content.countDocuments({ userId, status: "processing" }),
            Content.countDocuments({ userId, status: "ready" }),
            Content.countDocuments({ userId, status: "failed" }),
        ]);

        return Response.json({
            success : true,
            totalContents,
            totalPDF,
            totalYouTube,
            processing,
            ready,
            failed,
        },{
            status : 200
        })
    } catch (error) {
        console.log("Error fetching analytics");
        return Response.json({
            success : false,
            message : "Something went wrong"
        },{
            status : 500
        })
    }
}