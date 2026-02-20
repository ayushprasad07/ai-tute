import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY!);
console.log("HF KEY:", process.env.HUGGINGFACE_API_KEY?.slice(0, 10));


const MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// cache optional (prevents duplicate requests in same runtime)
const cache = new Map<string, number[]>();

export async function hfEmbedding(text: string): Promise<number[]> {
  try {
    if (!text) return [];

    // optional cache
    if (cache.has(text)) {
      return cache.get(text)!;
    }

    const embedding = await hf.featureExtraction({
      model: MODEL,
      inputs: text,
    });

    const vector = Array.from(embedding as number[]);

    cache.set(text, vector);

    return vector; // 384-dim vector same as before

  } catch (error) {
    console.error("HuggingFace embedding error:", error);
    throw new Error("Embedding failed");
  }
}
