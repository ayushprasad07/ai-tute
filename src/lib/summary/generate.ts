import Content from "@/models/Content";
import generateSummary from "../generateSummary";
import search from "../vector/search";


export default async function generateSummaryForContent(contentId : string){
    const chunk = await search(contentId, "Generate a complete structured summary for this content", 8);

    if(chunk.length===0){
        return "No Content was found"
    }

    const context = chunk.join("\n\n");

    const prompt = `
        You are an AI tutor.

        Create a clear, well-structured summary from the following learning material.

        Follow this structure strictly:
        1. Overview (2–3 lines)
        2. Key Concepts (bullet points)
        3. Important Definitions
        4. Key Notes / Takeaways

        Learning Material:
        ${context}
    `;

    const content = await generateSummary(prompt);

    await Content.updateOne({
        _id : contentId
    }, {
        $set : {
            content,
            status : "ready"
        }
    })

    return content;
}