export default function chunkText(
    text : string,
    chunkSize : 500,
    overlap : 100
):string[]{
    if(!text) return ["Something went wrong"];

    const word = text.split(/\s+/);
    const chunk : string[] = [];

    let start = 0;

    while(start<word.length){
        const end = start + chunkSize;
        const chunkText = word.slice(start, end).join(" ");

        chunk.push(chunkText);

        start += chunkSize - overlap;
    }

    return chunk;
}