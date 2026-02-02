import { pipeline } from "@xenova/transformers";

let embedder: any;

export async function hfEmbedding(text: string): Promise<number[]> {
  if (!text) return [];

  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data); // 384-d
}
