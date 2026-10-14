import { GoogleGenAI, Type } from '@google/genai';

const SYSTEM_INSTRUCTION =
  'Eres un asistente experto en desarrollo de software. Tu única tarea es generar snippets de Visual Studio Code en formato JSON estricto. NO incluyas introducciones, NO incluyas explicaciones, NO uses bloques de código Markdown (```json). Devuelve exclusivamente el objeto JSON del snippet.';

const SNIPPET_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: 'Nombre descriptivo del snippet',
    },
    prefix: {
      type: Type.STRING,
      description: 'El atajo que activa el snippet en VS Code',
    },
    body: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Líneas del código del snippet',
    },
    description: {
      type: Type.STRING,
      description: 'Breve explicación de lo que hace el snippet',
    },
    scope: {
      type: Type.STRING,
      description: 'Lenguaje o lenguajes donde aplica (ej: javascript, typescript)',
    },
  },
  required: ['name', 'prefix', 'body', 'description', 'scope'],
};

const SNIPPET_LIST_SCHEMA = {
  type: Type.ARRAY,
  items: SNIPPET_SCHEMA,
};

const LIST_SYSTEM_INSTRUCTION =
  'Eres un asistente experto en desarrollo de software. Tu única tarea es generar un listado de snippets de Visual Studio Code en formato JSON estricto (un array de objetos). Cada objeto tiene los campos name, prefix, body (array de líneas de código), description y scope. NO incluyas introducciones, NO incluyas explicaciones, NO uses bloques de código Markdown (```json). Devuelve exclusivamente el array JSON.';

export interface GoogleSnippetDraft {
  name: string;
  prefix: string;
  body: string[];
  description?: string;
  scope?: string;
}

export async function listGoogleModels(apiKey: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey });
  const pager = await ai.models.list();
  const names: string[] = [];

  for await (const model of pager) {
    const name = model.name?.replace(/^models\//, '');

    if (!name) continue;

    if (model.supportedActions && !model.supportedActions.includes('generateContent')) continue;

    names.push(name);
  }

  return names.sort();
}

export async function generateGoogleSnippet(prompt: string, model: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: SNIPPET_SCHEMA,
    },
  });

  return response.text ?? '';
}

export async function generateGoogleSnippetList(prompt: string, model: string, apiKey: string): Promise<GoogleSnippetDraft[]> {
  const ai = new GoogleGenAI({ apiKey });

  console.log({
    model,
    contents: prompt,
    config: {
      systemInstruction: LIST_SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: SNIPPET_LIST_SCHEMA,
    },
  })

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: LIST_SYSTEM_INSTRUCTION,
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: SNIPPET_LIST_SCHEMA,
    },
  });

  const text = response.text ?? '[]';
  const parsed = JSON.parse(text);

  return Array.isArray(parsed) ? parsed : [parsed];
}
