import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateQuizFromContext(context: string) {

  if (!context || context.length < 50) {
    console.log("Context too small");
    return [];
  }

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                You are an AI tutor.

                Generate exactly 5 quiz questions based STRICTLY on the CONTEXT below.

                CRITICAL RULES:
                - Use ONLY facts from the context
                - DO NOT say context is empty
                - DO NOT hallucinate
                - Each question must reference real facts
                - Return ONLY valid JSON

                FORMAT:
                {
                "questions": [
                    {
                    "question": "",
                    "options": ["","","",""],
                    "correctAnswer": "",
                    "explanation": ""
                    }
                ]
                }
                `
            },
            {
              text: "CONTEXT:\n" + context
            }
          ]
        }
      ],

      config: {
        temperature: 0.2,
      }
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("QUIZ RAW:", text);

    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return [];

    const parsed = JSON.parse(match[0]);

    return parsed.questions || [];

  } catch (error) {

    console.error("Quiz generation error:", error);

    return [];
  }
}