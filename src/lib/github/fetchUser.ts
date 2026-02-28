export async function fetchUser(repoUrl: string) {
    if(!repoUrl){
        throw new Error("Please provide source url");
    }

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

    if (!match) {
        throw new Error("Invalid GitHub repository URL");
    }

    const owner = match[1];
    const repo = match[2].replace(".git", "");

    return {
        owner,
        repo
    };
}