import { hfEmbedding } from "../hfEmbedding";
import { pineconeIndex } from "../pinecone";


export default async function search(
    contentId : string,
    query : string,
    topK : 8
) : Promise<string[]>{
    const embedding = await hfEmbedding(query);

    if(!embedding) return [];

    const result = await pineconeIndex.query({
        vector : embedding,
        topK : topK,
        includeMetadata : true,
        filter:{
            contentId : contentId
        }
    })

    if(!result.matches) return [];

    return result.matches?.map((match) => match.metadata?.text as string)
    .filter(Boolean) || [];
}