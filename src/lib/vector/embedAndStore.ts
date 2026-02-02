import { hfEmbedding } from "../hfEmbedding";
import { pineconeIndex } from "../pinecone";


export async function embedAndStore(
  chunks: string[],
  contentId: string
) {
  const vectors = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await hfEmbedding(chunks[i]);

    vectors.push({
      id: `${contentId}-chunk-${i}`,
      values: embedding,
      metadata: {
        contentId,
        chunkIndex: i,
        text: chunks[i],
      },
    });
  }

  await pineconeIndex.upsert(vectors);
}
