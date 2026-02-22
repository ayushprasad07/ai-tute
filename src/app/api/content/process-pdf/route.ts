// /api/content/process-pdf
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Content from "@/models/Content";
import mongoose from "mongoose";
import path from "path";
import { extractText } from "@/lib/pdf/extractText";
import cleanText from "@/lib/pdf/cleanText";
import chunkText from "@/lib/pdf/chunkText";
import { embedAndStore } from "@/lib/vector/embedAndStore";
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
    
    const {contentId} = await req.json();

    if(!contentId){
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


        const contentid = new mongoose.Types.ObjectId(contentId);

        const content = await Content.findOne({
            _id : contentid,
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

        if(content.type !== "pdf"){
            return Response.json({
                success : false,
                message : "Content type is not pdf"
            },{
                status : 400
            })
        }

        if(!content.sourceUrl){
            return Response.json({
                success : false,
                message : "Please provide source url"
            },{
                status : 400
            })
        }

        // const pdfPath = path.join(process.cwd(), content.sourceUrl.replace(/^\//, ""));
        const pdfPath = content.sourceUrl;

        const text = await extractText(pdfPath);
        const cleanedText = await cleanText(text);
        const chuncked =  chunkText(cleanedText, 500, 100);

        await embedAndStore(chuncked, contentId.toString());

        await Content.findOneAndUpdate({
            _id : contentId,
            status : "processing"
        })

        return Response.json({
            success : true,
            message : "PDF processed successfully",
            chuncked
        },{
            status : 200
        })
        
    } catch (error) {
        console.log("Error while processing pdf : ",error);

        await Content.findOneAndUpdate({
            _id : contentId,
            status : "failed"
        })

        return Response.json({
            success : false,
            message : "Error while processing pdf"
        },{
            status : 500
        })
    }
}