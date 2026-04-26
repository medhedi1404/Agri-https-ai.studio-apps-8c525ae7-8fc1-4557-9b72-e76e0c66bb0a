import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function analyzePlant(imageBuffer: ArrayBuffer, mimeType: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  
  const prompt = `Analyze this plant leaf or fruit image. 
  Identify any diseases or nutrient deficiencies.
  Return ONLY a valid JSON object with:
  - diseaseName: string (common name)
  - confidence: number (0 to 1)
  - treatment: string (organic or recommended treatment)
  - details: string (detailed explanation of why it was detected and key symptoms)
  - riskLevel: string (Low, Medium, High)
  
  If the plant is healthy, say "Healthy" in diseaseName.`;

  const base64Data = btoa(
    new Uint8Array(imageBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );

  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", text);
    throw new Error("Invalid response from AI");
  }
}

export async function askExpert(history: {role: string, content: string}[], message: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  // In this SDK, we might need to handle chat differently if it's not explicitly in the skill.
  // The skill shows examples for generateContent and generateContentStream.
  // I'll use generateContent with the whole history.
  
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: {
      systemInstruction: "Tu es Agri-Expert, un assistant spécialisé en agriculture tunisienne. Tu aides les agriculteurs à diagnostiquer les maladies et à améliorer leurs récoltes. Réponds de manière concise et pratique.",
    }
  });

  return response.text || "Désolé, je ne peux pas répondre pour le moment.";
}
