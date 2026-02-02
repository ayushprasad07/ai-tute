import fs from "fs-extra";
import {PDFParse}  from "pdf-parse";

export async function extractText(filePath: string): Promise<string> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const unaryPath = new Uint8Array(fileBuffer);
    const pdf = new PDFParse(unaryPath);
    const data = await pdf.getText();

    await pdf.destroy();

    return data.text;
  } catch (error) {
    console.error(error);
    throw new Error("Error while extracting text");
  }
}
