import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { generateChatAnswer } from "@/lib/chat/generate";
import Chat from "@/models/Chat";


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
        const {contentId, question} = await req.json();

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

        const answer = await generateChatAnswer(contentId, question);

        const chat = await Chat.findOneAndUpdate({
            contentId : new mongoose.Types.ObjectId(contentId),
        },{
            messages : [
                {
                    role : "user",
                    text : question
                },
                {
                    role : "assistant",
                    text : answer
                }
            ]
        })

        return Response.json({
            success : true,
            message : "Chat updated successfully",
            data : chat
        },{
            status : 200
        })
    } catch (error) {
        console.log("Internal server error : ",error);

        return Response.json({
            success : false,
            message : "Internal server error"
        },{
            status : 500
        })
    }
}