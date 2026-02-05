import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import mongoose from "mongoose";
import Chat from "@/models/Chat";

export async function GET( req : Request){ 
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

        const chats = await Chat.find({
            contentId : new mongoose.Types.ObjectId(contentId),
            messages : {
                $ne : []
            }
        })

        if(!chats){
            return Response.json({
                success : false,
                message : "Chats not found"
            },{
                status : 404
            })
        }

        return Response.json({
            success : true,
            message : "Chats fetched successfully",
            data : chats
        },{
            status : 200
        })
    } catch (error) {
        console.log("Error while fetching chats",error);

        return Response.json({
            success : false,
            message : "Error while fetching chats"
        },{
            status : 500
        })
    }
}