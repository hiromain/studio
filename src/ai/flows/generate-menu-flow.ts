'use server';
/**
 * @fileOverview Flow to generate a new menu using AI.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MenuSchema } from '@/lib/ai-schema';

const GenerateMenuInputSchema = z.object({
  userInput: z.string(),
  systemPrompt: z.string().optional(),
});
export type GenerateMenuInput = z.infer<typeof GenerateMenuInputSchema>;

const GeneratedMenuOutputSchema = MenuSchema;
export type GeneratedMenuOutput = z.infer<typeof GeneratedMenuOutputSchema>;

export const generateMenuFlow = ai.defineFlow(
  {
    name: 'generateMenuFlow',
    inputSchema: GenerateMenuInputSchema,
    outputSchema: GeneratedMenuOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: input.systemPrompt || 'Tu es un chef cuisinier expert. Ta mission est de créer des menus équilibrés et appétissants. Tu dois TOUJOURS répondre en FRANÇAIS. Réponds TOUJOURS en respectant strictement le format JSON demandé.',
        prompt: `Crée un menu complet en FRANÇAIS (plusieurs recettes comme entrée, plat, dessert) basé sur cette demande : "${input.userInput}". 
        Pour chaque recette, fournis tous les détails : titre, description, catégorie, temps, ingrédients et étapes.`,
        output: { schema: MenuSchema },
      });

      if (!output) {
        throw new Error('L\'IA a retourné un résultat vide.');
      }

      return output;
    } catch (error) {
      console.error('Erreur détaillée Genkit:', error);
      throw error;
    }
  }
);

export async function generateMenu(input: GenerateMenuInput): Promise<GeneratedMenuOutput> {
  return await generateMenuFlow(input);
}
