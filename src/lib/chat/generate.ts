import generateSummary from "../generateSummary";
import search from "../vector/search";


export async function generateChatAnswer(
    contentId : string,
    query : string
){
    const chunk = await search(contentId, query, 8);

    if(!chunk){
        return "I am unable to generate answer at this time please try again later.";
    }

    const context = chunk.join("\n\n");

    const prompt = `
        You are an AI tutor.

        Answer the user's question strictly using the provided content and provide a little more information releated to the content.
        If the answer is not present, say "The provided content does not contain this information." and then give some additional information

        Content:
        ${context}

        Question:
        ${query}

        Answer clearly and concisely.
    `;

    const result = await generateSummary(prompt);

    return result;

}