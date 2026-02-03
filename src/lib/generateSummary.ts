import { GoogleGenAI } from "@google/genai";

export default async function generateSummary(
    prompt : string
){
    if(!prompt) return "Some internal error occured";

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
    }); 

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config:{
            stopSequences: ["\n\n"],
            temperature: 0.5,
        }
    });

    if(!response.text) return "There was some error while generating text";

    return response.text
}