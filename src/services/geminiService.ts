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

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    destination: "Bali, Indonesia",
    description: "A tropical paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs.",
    estimatedCost: 800,
    activities: ["Beach Sunset", "Temple Visit", "Surfing"]
  },
  {
    destination: "Lisbon, Portugal",
    description: "Coastal city with hilly landscapes, pastel buildings, and great seafood.",
    estimatedCost: 1200,
    activities: ["Tuk-tuk Tour", "Fado Music", "Pasteis de Nata Tasting"]
  },
  {
    destination: "Tokyo, Japan",
    description: "A bustling metropolis mixing ultramodern skyscrapers with traditional temples.",
    estimatedCost: 2000,
    activities: ["Shibuya Crossing", "Sushi Workshop", "Mount Fuji Day Trip"]
  }
];

export async function getTripRecommendations(groupSize: number, budgetPerPerson: number, preferences: string): Promise<Recommendation[]> {
  // Basic input validation/sanitization
  const sanitizedGroupSize = Math.max(1, Math.min(50, groupSize));
  const sanitizedBudget = Math.max(100, Math.min(10000, budgetPerPerson));
  const sanitizedPrefs = preferences.slice(0, 200).replace(/[<>]/g, '');

  const prompt = `Suggest 3 group holiday destinations for a group of ${sanitizedGroupSize} people with a budget of $${sanitizedBudget} per person. Preferences: ${sanitizedPrefs}. Return a JSON array of objects with destination, description, estimatedCost (per person), and activities (array of strings).`;

  try {
    const ai = getAI();

    // Using a Promise wrapper for timeout handling
    const recommendationPromise = ai.models.generateContent({
      model: "gemini-2.0-flash",
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

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 10000)
    );

    const response = await Promise.race([recommendationPromise, timeoutPromise]);
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Return curated defaults as fallback
    return DEFAULT_RECOMMENDATIONS;
  }
}
