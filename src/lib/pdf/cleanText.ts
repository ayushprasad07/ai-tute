export default async function cleanText(rawText : string){

    if(!rawText) return "";

    let text = rawText;

    text = text.replace(/\r\n/g, "\n");

    //  Remove excessive newlines (more than 2)
    text = text.replace(/\n{3,}/g, "\n\n");

    //  Fix broken sentences (line breaks in middle)
    text = text.replace(/([a-zA-Z])\n([a-zA-Z])/g, "$1 $2");

    //  Remove page numbers (common patterns)
    text = text.replace(/\n?\s*Page\s+\d+\s*\n?/gi, "\n");
    text = text.replace(/\n?\s*\d+\s*\n/g, "\n");

    //  Remove extra spaces
    text = text.replace(/[ \t]{2,}/g, " ");

    //  Trim whitespace
    text = text.trim();

    return text;
}