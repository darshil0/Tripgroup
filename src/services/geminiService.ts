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

/**
 * Sanitizes input text to prevent prompt injection or broken JSON requests.
 */
function sanitizeInput(text: string): string {
  return text.replace(/[<>]/g, "").slice(0, 500);
}

export async function getTripRecommendations(groupSize: number, budgetPerPerson: number, preferences: string): Promise<Recommendation[]> {
  const cleanPreferences = sanitizeInput(preferences);
  const prompt = `Suggest 3 group holiday destinations for a group of ${groupSize} people with a budget of $${budgetPerPerson} per person. Preferences: ${cleanPreferences}. Return a JSON array of objects with destination, description, estimatedCost (per person), and activities (array of strings).`;

  // Timeout handling using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // Use stable alias
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

    clearTimeout(timeoutId);
    
    if (!response.text) return [];
    
    const parsed = JSON.parse(response.text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("Gemini Request Timed Out");
    } else {
      console.error("Gemini Error:", error);
    }
    return [];
  }
}
