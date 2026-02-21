import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import Quizes from "@/models/Quizes";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

// /api/quiz/get-quiz/[contentId]

export async function GET(
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

    try {
        const {contentId} = await params;

        if(!contentId){
            return Response.json({
                success : false,
                message : "Please provide content"
            },{
                status : 400
            })
        }

        const content = await Content.findOne({
            _id : new mongoose.Types.ObjectId(contentId)
        });

        if(!content){
            return Response.json({
                success : false,
                message : "Content not found"
            },{
                status : 404
            })
        }

        const quiz = await Quizes.findOne({
            contentId : new mongoose.Types.ObjectId(contentId),
        });

        if(!quiz){
            return Response.json({
                success : false,
                message : "Quiz not found"
            },{
                status : 404
            })
        }

        return Response.json({
            success : true,
            message : quiz ? "Quiz found" : "No quiz found for this content",
            data : quiz
        },{
            status : 200
        })
    } catch (error) {
        console.log("Error getting quiz");
        return Response.json({
            success : false,
            message : "Something went wrong"
        },{
            status : 500
        })
    }
}