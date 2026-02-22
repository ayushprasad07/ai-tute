// /api/content/process-youtube

import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { extractTranscript } from "@/lib/youtube/extractTranscript";
import cleanText from "@/lib/pdf/cleanText";
import chunkText from "@/lib/pdf/chunkText";
import { embedAndStore } from "@/lib/vector/embedAndStore";
import { localWhisperTranscribe } from "@/lib/youtube/localWhisper";
import { protectRoute } from "@/lib/protectRoute";


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

    const {contentId, sourceUrl} = await req.json();

    if(!contentId || !sourceUrl){
        return Response.json({
            success : false,
            message : "Please provide content"
        },{
            status : 400
        })
    }

    const blocked = await protectRoute({
      action: "process-pdf",
      req,
      contentId,
      userLimit: 5,     // heavy operation → strict limit
      ipLimit: 10,
      contentLimit: 2,
      window: 60
    });

    if (blocked) return blocked;

    try {
        const content = await Content.findOne({
            _id : new mongoose.Types.ObjectId(contentId),
            userId,
            type : "youtube"
        });

        if(!content ){
            return Response.json({
                success : false,
                message : "Content not found"
            },{
                status : 404
            })
        }

        let transcript : string = "";

        try {
            console.log("🎬 Trying transcript API...");
            transcript = await extractTranscript(sourceUrl);
        } catch {
            console.log("⚠️ Transcript API failed — using LOCAL WHISPER");

            transcript = await localWhisperTranscribe(sourceUrl);
        }

        if (!transcript || transcript.length < 50) {
        throw new Error("Transcript generation failed");
        }

        if(!transcript){
            return Response.json({
                success : false,
                message : "Transcript not found"
            },{
                status : 400
            })
        }

        const cleanedText = await cleanText(transcript);
        const chunked =  chunkText(cleanedText,500,100);

        await embedAndStore(chunked, contentId);

        await Content.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(contentId),
            userId,
            type: "youtube",
        },
        {
            $set: {
            status: "processing",
            sourceUrl: sourceUrl,
            },
        },
        {
            new: true,
        }
        );

        return Response.json({
            success : true,
            message : "Content processed successfully"
        },{
            status : 200
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