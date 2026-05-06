import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY is not defined. AI features require this key.");
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

export async function getTripRecommendations(groupSize: number, budgetPerPerson: number, preferences: string, retries = 2): Promise<Recommendation[]> {
  const cleanPreferences = sanitizeInput(preferences);
  const prompt = `Suggest 3 group holiday destinations for a group of ${groupSize} people with a budget of $${budgetPerPerson} per person. Preferences: ${cleanPreferences}. Return a JSON array of objects with destination, description, estimatedCost (per person), and activities (array of strings).`;

  const executeRequest = async (attempt: number): Promise<Recommendation[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
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
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      if (attempt < retries) {
        console.warn(`Gemini attempt ${attempt + 1} failed. Retrying...`, isTimeout ? "Timeout" : error);
        return executeRequest(attempt + 1);
      }

      if (isTimeout) {
        console.error("Gemini Request Timed Out after maximum attempts");
      } else {
        console.error("Gemini AI Layer Error:", error);
      }
      return [];
    }
  };

  return executeRequest(0);
}
