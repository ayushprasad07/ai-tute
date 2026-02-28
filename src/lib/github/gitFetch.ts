export async function gitFetch(sourceUrl : string) {

    if(!sourceUrl){
        throw new Error("Please provide source url");
    }

    const res = await fetch(sourceUrl,{
        headers:{
            Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept : "application/vnd.github+json"
        }
    });

    if(!res.ok){
        throw new Error("Failed to fetch from github");
    }

    return res.json();
}