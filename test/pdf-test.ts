import { hfEmbedding } from "@/lib/hfEmbedding";
import chunkText from "@/lib/pdf/chunkText";
import cleanText from "@/lib/pdf/cleanText";
import { extractText } from "@/lib/pdf/extractText";
import path from "path";
import "dotenv/config";

async function runTest() {

  const pdfPath = path.join(
    process.cwd(),
    "uploads/pdfs/sample.pdf"
  );

  // Step 1: extract text
  const text = await extractText(pdfPath);

  console.log("HF KEY:", process.env.HUGGINGFACE_API_KEY?.slice(0, 10));

  console.log("✅ PDF TEXT EXTRACTED");
  console.log(text.slice(0, 200));

  // Step 2: clean text
  const cleanedText = await cleanText(text);

  console.log("✅ PDF TEXT CLEANED");
  console.log(cleanedText.slice(0, 200));

  // Step 3: chunk text
  const chunks = chunkText(cleanedText, 500, 100);

  console.log("✅ PDF TEXT CHUNKED");
  console.log("Total chunks:", chunks.length);

  if (chunks.length === 0) {
    throw new Error("No chunks generated");
  }

  // Step 4: embed first chunk only (test)
  const embedding = await hfEmbedding(chunks[0]);

  console.log("✅ EMBEDDING GENERATED");

  console.log("Embedding dimension:", embedding.length);

  console.log("First 5 values:", embedding.slice(0, 5));

}

runTest().catch(console.error);
