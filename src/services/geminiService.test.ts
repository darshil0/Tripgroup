import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTripRecommendations } from './geminiService';

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function () {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify([
              {
                destination: 'Santorini, Greece',
                description: 'Stunning volcanic views and whitewashed villages.',
                estimatedCost: 600,
                activities: ['Sailing', 'Wine Tasting', 'Sunset Watch'],
              },
            ]),
          }),
        },
      };
    }),
    Type: {
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
    },
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key';
  });

  it('fetches trip recommendations successfully', async () => {
    const recommendations = await getTripRecommendations(4, 500, 'beach and warmth');
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].destination).toBe('Santorini, Greece');
    expect(recommendations[0].estimatedCost).toBe(600);
    expect(recommendations[0].activities).toContain('Sailing');
  });
});
