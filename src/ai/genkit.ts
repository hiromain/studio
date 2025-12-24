import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || "AIzaSyA-YOcE_c1vQBMhiV78beVC2PCB1w3mnds"
    })
  ],
  model: 'googleai/gemini-2.0-flash',
});
