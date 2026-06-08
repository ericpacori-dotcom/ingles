// src/services/aiService.js

const getGeminiConfig = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.1-flash-lite'; 
  
  if (!apiKey || apiKey.length < 15) throw new Error("Llave de API inválida");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  return { url };
};

export const fetchWordExplanation = async (word, sentenceContext) => {
  const { url } = getGeminiConfig();
  
  const promptText = `
    Eres un tutor de inglés. El usuario tocó la palabra "${word}" dentro de esta oración:
    "${sentenceContext}"
    1. Analiza si "${word}" es parte de una expresión, idiom o phrasal verb en esa oración exacta. Si es parte de una frase, tu campo "expression" debe ser esa frase completa (ej: "give up"). Si es solo la palabra, la expresión es "${word}".
    2. Explica qué significa en ESE contexto exacto usando palabras muy sencillas. NUNCA saludes.
    3. Agrega un tip MUY corto sobre su uso (ej: "es muy formal", "se usa en saludos casuales").
    Devuelve ESTE JSON puro:
    {
      "expression": "La frase o palabra detectada en inglés",
      "emoji": "1 solo emoji relevante",
      "translation": "Traducción exactas en este contexto",
      "pronunciation": "Pronunciación figurada en español",
      "grammar": "Ej: Phrasal Verb, Sustantivo, Modismo...",
      "definition": "Breve explicación en español con palabras sencillas y el tip corto de uso",
      "audioScript": "Guion amigable y corto en español directo al punto, incluyendo el tip de uso"
    }
  `;

  const response = await fetch(url, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: promptText }] }], 
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" } 
    })
  });

  if (!response.ok) throw new Error("Fallo API Gemini");
  const aiData = await response.json();
  return JSON.parse(aiData.candidates[0].content.parts[0].text);
};

// --- NUEVA FUNCIÓN EXCLUSIVA PARA TRADUCIR FRASES SELECCIONADAS ---
export const fetchPhraseExplanation = async (phrase, paragraphContext) => {
  const { url } = getGeminiConfig();
  
  const promptText = `
    Eres un tutor de inglés. El usuario seleccionó manualmente esta frase exacta: "${phrase}"
    Dentro de este párrafo de contexto: "${paragraphContext}"
    
    Explica qué significa esa frase exactamente en ese contexto usando palabras muy sencillas. NUNCA saludes.
    Agrega un tip MUY corto sobre su uso (ej: "es una frase hecha", "suena muy poético").
    Devuelve ESTE JSON puro:
    {
      "expression": "${phrase}",
      "emoji": "1 solo emoji relevante para la frase",
      "translation": "Traducción natural de la frase completa al español",
      "pronunciation": "Pronunciación figurada en español de la frase",
      "grammar": "Frase / Expresión",
      "definition": "Explicación breve con palabras sencillas de por qué se usa así y el tip corto",
      "audioScript": "Guion amigable y corto en español explicando la frase y dando el tip"
    }
  `;

  const response = await fetch(url, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: promptText }] }], 
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" } 
    })
  });

  if (!response.ok) throw new Error("Fallo API Gemini");
  const aiData = await response.json();
  return JSON.parse(aiData.candidates[0].content.parts[0].text);
};

export const fetchParagraphSummary = async (paragraphText) => {
  const { url } = getGeminiConfig();

  const promptText = `
    Eres un tutor de inglés. Lee este párrafo en inglés y escribe un resumen súper breve en español (máximo 2 oraciones) que cuente únicamente los hechos del fragmento.
    
    REGLAS ESTRICTAS: 
    1. Ve directo al grano. NO saludes, NO te presentes.
    2. NO des opiniones, NO saques conclusiones, NO agregues moralejas. Está estrictamente prohibido usar frases como "Esto demuestra que...", "Aquí vemos cómo...", "En resumen..." o similares. Solo devuelve el resumen puro de lo que pasa en la historia.
    
    Párrafo:
    "${paragraphText}"
  `;

  const response = await fetch(url, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: promptText }] }], 
      generationConfig: { temperature: 0.1 } 
    })
  });

  if (!response.ok) throw new Error("Fallo API Gemini");
  const aiData = await response.json();
  return aiData.candidates[0].content.parts[0].text;
};