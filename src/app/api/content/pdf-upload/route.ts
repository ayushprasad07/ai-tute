import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Content from "@/models/Content";
import fs from "fs-extra";
import path from "path";
import fromidable from "formidable";

const uploadDir = path.join(process.cwd(),"uploads/pdfs");

fs.ensureDirSync(uploadDir);

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

    try {
        const form  = fromidable({
            multiples : false,
            uploadDir,
            keepExtensions : true,
            maxFileSize : 10 * 1024 * 1024
        });

        const {fields, files} = await new Promise<any>((resolve,reject) => {
            form.parse(req as any, (err, fields, files) => {
                if(err){
                    reject(err);
                }else{
                    resolve({fields,files});
                }
            })
        });

        const file = files.pdf;

        if(!file){
            return Response.json({
                success : false,
                message : "No file uploaded"
            },{
                status : 400
            })
        }

        if(file.mimetype !== "application/pdf"){
            return Response.json({
                success : false,
                message : "Invalid file type"
            },{
                status : 400
            })
        }

        const content  = await Content.create({
            userId : session.user._id,
            type : "pdf",
            title : fields.title,
            sourceUrl : `/uploads/pdfs/${path.basename(file.filepath)}`,
            status : "processing"
        });

        return Response.json({
            success : true,
            message : "PDF uploaded successfully",
            content
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