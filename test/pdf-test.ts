import chunkText from "@/lib/pdf/chunkText";
import cleanText from "@/lib/pdf/cleanText";
import { extractText } from "@/lib/pdf/extractText";
import path from "path";

async function runTest() {
  const pdfPath = path.join(
    process.cwd(),
    "uploads/pdfs/sample.pdf"
  );

  const text = await extractText(pdfPath);
  const cleanedText = await cleanText(text);
  const chuncked =  chunkText(cleanedText, 500, 100);

  console.log("✅ PDF TEXT EXTRACTED");
  console.log(text.slice(0, 500)); // preview first 500 chars

  console.log("✅ PDF TEXT CLEANED");
  console.log(cleanedText.slice(0, 500)); // preview first 500 chars

  console.log("✅ PDF TEXT CHUNKED");
  console.log(chuncked[0].slice(0, 500)); // preview first 500 chars
  console.log(chuncked[1].slice(0, 500)); // preview first 500 chars
  console.log(chuncked.length);
}

runTest().catch(console.error);
