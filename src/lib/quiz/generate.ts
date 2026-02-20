import generateSummary from "../generateSummary";
import search from "../vector/search";

export async function generateQuiz(contentId: string) {

    const chunks = await search(
        contentId,
        "Generate quiz questions from this content",
        8
    );

    if (!chunks || chunks.length === 0) {
        return [];
    }

    const context = chunks
        .map((c: any) => c.text)
        .join("\n\n");

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

    const response = await generateSummary(prompt);

    try {

        const cleaned = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleaned);

        return parsed.questions || [];

    } catch (error) {

        console.error("Quiz parse error:", error);

        return [];
    }
}
