import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Content from "@/models/Content";
import mongoose from "mongoose";
import generateSummaryForContent from "@/lib/summary/generate";


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

        const {contentId} = await req.json();

        if(!contentId){
            return Response.json({
                success : false,
                message : "Please provide content"
            },{
                status : 400
            })
        }

        const content = await Content.findOne({
            _id : new mongoose.Types.ObjectId(contentId),
            userId
        });

        if(!content){
            return Response.json({
                success : false,
                message : "Content not found"
            },{
                status : 404
            })
        }

        if(content.status === "ready" && content.content){
            return Response.json({
                success : false,
                message : "Content already generated summary",
                content : content.content
            },{
                status : 400
            })
        }

        const summary = await generateSummaryForContent(contentId);

        return Response.json({
            success : true,
            message : "Summary generated successfully",
            content : summary
        },{
            status : 200
        })
        
    } catch (error) {
        console.log("Error while generating summary : ",error);

        return Response.json({
            success : false,
            message : "Error while generating summary"
        },{
            status : 500
        })
    }
}