import { gitFetch } from "./gitFetch";

export async function fetchRepo(
    owner : string,
    repo : string
) {

    if(!owner || !repo){
        throw new Error("Please provide owner and repo");
    }
    
    const data = await gitFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`
    );

    if(!data){
        throw new Error("Failed to fetch from github");
    }

    const files = data.tree.filter(
        (file: any) =>
        file.type === "blob" &&
        (
            file.path.endsWith(".ts") ||
            file.path.endsWith(".js") ||
            file.path.endsWith(".tsx") ||
            file.path.endsWith(".jsx") ||
            file.path.endsWith(".py") ||
            file.path.endsWith(".java")
        )
    );

    return files;
}