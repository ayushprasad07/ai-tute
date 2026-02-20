import fs from "fs";

// 🔥 bypass pdf-parse index.js debug code
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function extractText(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error(error);
    throw new Error("Error while extracting text");
  }
}
