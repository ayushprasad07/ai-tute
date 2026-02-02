import { extractText } from "@/lib/pdf/extractText";
import path from "path";

async function runTest() {
  const pdfPath = path.join(
    process.cwd(),
    "uploads/pdfs/sample.pdf"
  );

  const text = await extractText(pdfPath);

  console.log("✅ PDF TEXT EXTRACTED");
  console.log(text.slice(0, 500)); // preview first 500 chars
}

runTest().catch(console.error);
