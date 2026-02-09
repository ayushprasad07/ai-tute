import { Pinecone } from "@pinecone-database/pinecone";

export const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
})

export const pineconeIndex = pc.Index(process.env.PINECONE_INDEX!)