import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import mongoose from "mongoose";
import { fetchUser } from "@/lib/github/fetchUser";
import { extractRepoText } from "@/lib/github/extractRepoText";
import chunkText from "@/lib/pdf/chunkText";
import { embedAndStore } from "@/lib/vector/embedAndStore";
import { fetchRepo } from "@/lib/github/fetchRepoTree";
import { fetchFileContent } from "@/lib/github/fetchFileContent";
import { buildRepoGraph } from "@/lib/github/buildRepoGraph";

// /api/content/process-github

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
        const {contentId, sourceUrl} = await req.json();

        if(!contentId || !sourceUrl){
            return Response.json({
                success : false,
                message : "All fields are required"
            },{
                status : 400
            })
        }

        const content = await Content.findOne({
            _id : new mongoose.Types.ObjectId(contentId),
            userId,
            type : "github"
        });

        if(!content){
            return Response.json({
                success : false,
                message : "Content not found"
            },{
                status : 404
            })
        }

        const {owner, repo} = await fetchUser(sourceUrl);

        const files = await fetchRepo(owner, repo);

        const fullFile = [];

        let combinedText = "";

        for (const file of files.slice(0,40)){
            const fileContent = await fetchFileContent(
                owner,
                repo,
                file.path
            );

            fullFile.push(
                {
                    path : file.path,
                    content : fileContent,
                    size : file.size
                }
            )

            combinedText += `FILE: ${file.path}\n`;
            combinedText += fileContent + "\n\n";
        }

        const graph = await buildRepoGraph(fullFile);

        const repoText = await extractRepoText(owner, repo);

        const chunk = chunkText(repoText, 500, 100);

        await embedAndStore(chunk, contentId);

        await Content.updateOne(
            { _id: contentId },
            {
                $set: {
                repoGraph: graph,
                repoFiles: fullFile.map(f => ({
                    path: f.path,
                    size: f.size,
                    type: "file"
                })),
                sourceUrl: sourceUrl,
                status: "ready"
                }
            }
        );

        return Response.json({
            success : true,
            message : "Content processed successfully"
        },{
            status : 200
        })
    } catch (error) {
        console.log(error);

        return Response.json({
            success : false,
            message : "Something went wrong"
        },{
            status : 500
        })
    }
}