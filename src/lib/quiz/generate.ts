import generateSummary from "../generateSummary";
import search from "../vector/search";


export async function generateQuiz(contentId : string){
    const chunk = await search(contentId, "Generate a complete structured summary for this content", 8);

    if(chunk.length===0){
        return "No Content was found"
    }

    const context = chunk.join("\n\n");

    const prompt = `
        You are an AI tutor.

        Create 5 multiple-choice quiz questions based ONLY on the content below.

        Return STRICT JSON in this format:
        {
        "questions": [
            {
            "question": "",
            "options": ["", "", "", ""],
            "correctAnswer": "",
            "explanation": ""
            }
        ]
        }

        Content:
        ${context}
    `;

    const content = await generateSummary(prompt);

    return JSON.parse(content).questions;

}