import { geminiEmbedding } from "@/lib/gemeni";
import { hfEmbedding } from "@/lib/hfEmbedding";



(async () => {
  const emb = await hfEmbedding("AI helps students learn better");
  console.log(emb?.length); // should print 768
})();
