import { generateQuizFromContext } from "@/lib/quiz/generateQuizFromContext";
import search from "../vector/search";

export async function generateQuiz(contentId: string) {

  const chunks = await search(
    contentId,
    "technical skills education projects",
    8
  );

//   console.log("🔥 Chunks from vector search:", chunks);

  if (!chunks.length) return [];

  const context = chunks.join("\n\n");

  return await generateQuizFromContext(context);
}