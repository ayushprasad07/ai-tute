// /api/content/fetch-all
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import { protectRoute } from "@/lib/protectRoute";


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

        const blocked = await protectRoute({
            action: "fetch-all",
            req,
            userLimit: 30,   // user can fetch 30 times/min
            ipLimit: 60,     // IP can fetch 60 times/min
            window: 60
        });

        if (blocked) return blocked;

        const contents = await Content.find({
            userId : new mongoose.Types.ObjectId(userId)
        });

        if(!contents){
            return Response.json({
                success : false,
                message : "No contents found"
            },{
                status : 404
            })
        }
        
        return Response.json({
            success : true,
            message : "Contents fetched successfully",
            contents
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