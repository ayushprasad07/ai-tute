import { fetchFileContent } from "./fetchFileContent";
import { fetchRepo } from "./fetchRepoTree";

export async function extractRepoText(
    owner : string,
    repo : string
){

    if(!owner || !repo){
        throw new Error("Please provide owner and repo");
    }

    const files = await fetchRepo(owner, repo);

    let fullText = "";

    for (const file of files) {
        const content = await fetchFileContent(owner, repo, file.path);
        fullText += `FILE: ${file.path}\n`;
        fullText += content;
        fullText += "\n\n";
    }

    return fullText;
}