import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { extractTranscript } from "@/lib/youtube/extractTranscript";
import cleanText from "@/lib/pdf/cleanText";
import chunkText from "@/lib/pdf/chunkText";
import { embedAndStore } from "@/lib/vector/embedAndStore";


export async function POST(req:Request) {
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

    const {contentId} = await req.json();

    if(!contentId){
        return Response.json({
            success : false,
            message : "Please provide content"
        },{
            status : 400
        })
    }

    try {
        const content = await Content.findOne({
            _id : new mongoose.Types.ObjectId(contentId),
            userId,
            type : "youtube"
        });

        if(!content || !content.sourceUrl){
            return Response.json({
                success : false,
                message : "Content not found"
            },{
                status : 404
            })
        }

        const transcript = await extractTranscript(content.sourceUrl);

        const cleanedText = await cleanText(transcript);
        const chunked =  chunkText(cleanedText,500,100);

        await embedAndStore(chunked, contentId);

        await Content.findOneAndUpdate({
            _id : new mongoose.Types.ObjectId(contentId),
            userId,
            type : "youtube",
            status : "processing"

        })
        return Response.json({
            success : true,
            message : "Content processed successfully"
        })
        
    } catch (error) {
        console.log("Error while processing content",error);

        await Content.findOneAndUpdate({
            _id : contentId,
            status : "failed"
        })

        return Response.json({
            success : false,
            message : "Internal Server error"
        },{
            status : 500
        })
    }
    
}