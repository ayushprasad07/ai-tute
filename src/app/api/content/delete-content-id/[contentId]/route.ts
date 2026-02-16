import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

// /api/content/delete-content-id/[contentId]


export async function DELETE(
    req : Request,
    {params} : {params : Promise<{contentId : string}>}
){
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

        const {contentId} = await params;

        console.log(contentId);

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
        })

        if(!content){
            return Response.json({
                success : false,
                message : "Content not found"
            },{
                status : 404
            })
        }

        await Content.deleteOne({
            _id : new mongoose.Types.ObjectId(contentId)
        })

        return Response.json({
            success : true,
            message : "Content deleted successfully"
        },{
            status : 200
        })
        
    } catch (error) {
        console.log(error);
        return Response.json({
            success : false,
            message : "Internal Server error"
        },{
            status : 500
        })
    }
}