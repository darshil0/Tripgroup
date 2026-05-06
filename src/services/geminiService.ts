import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface Recommendation {
  destination: string;
  description: string;
  estimatedCost: number;
  activities: string[];
}

export async function getTripRecommendations(groupSize: number, budgetPerPerson: number, preferences: string): Promise<Recommendation[]> {
  const prompt = `Suggest 3 group holiday destinations for a group of ${groupSize} people with a budget of $${budgetPerPerson} per person. Preferences: ${preferences}. Return a JSON array of objects with destination, description, estimatedCost (per person), and activities (array of strings).`;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedCost: { type: Type.NUMBER },
              activities: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["destination", "description", "estimatedCost", "activities"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
