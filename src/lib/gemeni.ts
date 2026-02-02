import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});


export async function geminiEmbedding(
  text: string
): Promise<number[]> {
  if (!text) return [];

  const response = await ai.models.embedContent({
    model: "models/embedding-001",
    contents: text,
  });

  const embedding = response.embeddings?.[0]?.values;

  if (!embedding) {
    throw new Error("Gemini returned no embedding");
  }

  return embedding; // 768 dimensions
}
