import { generateMenu } from './src/ai/flows/generate-menu-flow';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('--- Test de génération de menu ---');
  try {
    const result = await generateMenu({
      userInput: 'Un menu de fête pour 2 personnes',
      systemPrompt: 'Tu es un chef.'
    });
    console.log('Résultat:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERREUR CAPTURÉE:', error);
  }
}

test();
