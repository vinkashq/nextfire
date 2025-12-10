import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

const defaultConfig = {
  plugins: [googleAI()],
}

const ai = genkit(defaultConfig)

export default ai
