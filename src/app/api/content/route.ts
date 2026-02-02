import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export default async function POST(req : Request){
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
        const {title , type, sourceUrl} = await req.json();

        if(!title || !type){
            return Response.json({
                success : false,
                message : "All fields are required"
            },{
                status : 400
            })
        }

        const content = await Content.create({
            userId,
            title,
            type,
            sourceUrl,
            status : "processing"
        });

        return Response.json({
            success : true,
            message : "Content created successfully",
            content
        },{
            status : 200
        })
    } catch (error) {
        console.log("Internal server error",error);
        return Response.json({
            success : false,
            message : "Internal server error"
        },{
            status : 500
        })
    }
}