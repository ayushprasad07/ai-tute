import { gitFetch } from "./gitFetch";

export async function fetchFileContent(
    owner : string,
    repo : string,
    path : string
){

    if(!owner || !repo || !path){
        throw new Error("Please provide owner, repo and path");
    }

    const data = await gitFetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    );

    if(!data){
        throw new Error("Failed to fetch from github");
    }

    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return content;
}