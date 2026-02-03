// import { geminiEmbedding } from "@/lib/gemeni";
import "dotenv/config"
import generateSummary from "@/lib/generateSummary";
import { hfEmbedding } from "@/lib/hfEmbedding";



(async () => {
  const emb = await hfEmbedding("AI helps students learn better");
  console.log(emb?.length); // should print 768

  const gemeni = await generateSummary("Does AI helps students learn better");
  console.log(gemeni); // should print 768
})();
