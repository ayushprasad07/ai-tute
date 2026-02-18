const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function extractText(filePath: string): Promise<string> {
  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdfParse(buffer);

    return data.text;
  } catch (error) {
    console.error(error);
    throw new Error("Error while extracting text");
  }
}
