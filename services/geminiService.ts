// FIX: Implement the Gemini API service to generate study guides.
import { GoogleGenAI, Type } from "@google/genai";
import { StudyGuide, Difficulty } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const studyGuideSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise summary of the key topics from the document, written in a few paragraphs."
        },
        qaPairs: {
            type: Type.ARRAY,
            description: "A list of important questions and their answers based on the document content.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
            }
        },
        flashcards: {
            type: Type.ARRAY,
            description: "A list of flashcards with a key term/concept on the front and a definition/explanation on the back.",
            items: {
                type: Type.OBJECT,
                properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                },
                required: ["front", "back"]
            }
        }
    },
    required: ["summary", "qaPairs", "flashcards"]
};


export const generateStudyGuide = async (textContent: string, difficulty: Difficulty): Promise<StudyGuide> => {
    const prompt = `Based on the following document text, generate a comprehensive study guide tailored for a ${difficulty} level of understanding. The study guide should include a summary of key topics, a list of question-and-answer pairs, and a set of flashcards.

- For a 'beginner' level, use simple language, focus on core concepts, and provide clear definitions.
- For an 'intermediate' level, assume some prior knowledge and include more detailed explanations and connections between topics.
- For an 'advanced' level, delve into complex details, nuances, and potential areas for further study.

Document Text:
---
${textContent}
---

Please provide the output in the requested JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: studyGuideSchema
            },
        });

        const jsonText = response.text.trim();
        const studyGuideData: StudyGuide = JSON.parse(jsonText);
        
        // Basic validation
        if (!studyGuideData.summary || !Array.isArray(studyGuideData.qaPairs) || !Array.isArray(studyGuideData.flashcards)) {
            throw new Error("The generated study guide is missing required fields.");
        }

        return studyGuideData;
    } catch (error) {
        console.error("Error generating study guide with Gemini:", error);
        throw new Error("Failed to generate the study guide. The AI model may be experiencing issues or the content could not be processed.");
    }
};