import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini API
// The API key is injected via Vite's define plugin from process.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function interpretDream(dreamText: string, language: 'en' | 'ur', problem?: string) {
  const systemInstruction = language === 'ur' 
    ? "You are a mystical Sufi dream interpreter. Interpret the dream in poetic, beautiful Urdu (using Noto Nastaliq style phrasing). Extract core symbols, emotions, a waking quest, and creative prompts. Return JSON."
    : "You are a mystical Sufi dream interpreter. Interpret the dream in a poetic, ethereal, and spiritual tone. Extract core symbols, emotions, a waking quest, and creative prompts. Return JSON.";

  const problemContext = problem 
    ? `The dreamer was trying to solve this problem: "${problem}". Provide a 'problemInsight' connecting the dream to a potential solution.` 
    : '';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Dream: "${dreamText}"\n\n${problemContext}\n\nProvide a poetic interpretation, symbols, emotions, a waking quest, and muse prompts.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: {
              type: Type.STRING,
              description: "A poetic, Sufi-inspired interpretation of the dream.",
            },
            symbols: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 core symbols from the dream.",
            },
            emotions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 core emotions felt in the dream.",
            },
            wakingQuest: {
              type: Type.STRING,
              description: "A single, actionable mindfulness task for the day based on the dream.",
            },
            musePrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 creative prompts (e.g., for writing, drawing, coding) inspired by the dream.",
            },
            problemInsight: {
              type: Type.STRING,
              description: "If a problem was provided, a lateral-thinking insight connecting the dream to a potential solution.",
            }
          },
          required: ["interpretation", "symbols", "emotions", "wakingQuest", "musePrompts"],
        },
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error interpreting dream:", error);
    return {
      interpretation: language === 'ur' ? "خواب کے اسرار گہرے ہیں۔" : "The mysteries of the dream are deep.",
      symbols: ["mystery"],
      emotions: ["wonder"],
      wakingQuest: language === 'ur' ? "آج سکون تلاش کریں۔" : "Find stillness today.",
      musePrompts: ["Draw a mystery", "Write about the unknown", "Reflect on silence"]
    };
  }
}

export async function generateOracleSeed(language: 'en' | 'ur') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: "Generate a short, cryptic, poetic 'dream seed' or intention for the user to focus on before falling asleep. Max 2 sentences.",
      config: {
        systemInstruction: language === 'ur' 
          ? "You are a mystical Sufi guide. Respond in beautiful Urdu." 
          : "You are a mystical Sufi guide. Respond in poetic English.",
      }
    });
    return response.text?.trim() || '';
  } catch (error) {
    console.error("Error generating oracle seed:", error);
    return language === 'ur' ? "آج رات روشنی کی تلاش کریں۔" : "Seek the light tonight.";
  }
}

export async function generateDreamImage(dreamText: string, symbols: string[]) {
  try {
    const prompt = `A surreal, ethereal, dark mystical painting of a dream. Deep indigo, midnight purple, soft gold accents, glowing cyan and magenta ethereal threads. Sufi mysticism, magical realism. Elements: ${symbols.join(', ')}. Dream context: ${dreamText.substring(0, 100)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    // Extract base64 image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating dream image:", error);
    return null;
  }
}
