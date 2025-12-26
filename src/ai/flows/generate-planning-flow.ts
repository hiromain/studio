'use server';
/**
 * @fileOverview Flow to generate a meal plan for several days.
 * 
 * - generatePlanning - Generates a meal plan based on user constraints and available recipes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { RecipeSchema } from '@/lib/ai-schema';

// Define input schemas
const GeneratePlanningInputSchema = z.object({
    recipes: z.array(RecipeSchema.pick({ id: true, title: true, category: true, description: true })),
    duration: z.coerce.number().int().positive().describe("The number of days to plan for."),
    constraints: z.string().describe("User's constraints and preferences for the meal plan."),
});
export type GeneratePlanningInput = z.infer<typeof GeneratePlanningInputSchema>;

// Schema pour une recette complète générée à la volée (sans ID)
const GeneratedRecipeDetailSchema = z.object({
  title: z.string().describe('Clean title, no disclaimers.'),
  description: z.string().describe('Short description.'),
  category: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  ingredients: z.array(z.object({ name: z.string(), quantity: z.string() })),
  steps: z.array(z.string()),
});

const PlannedMealSchema = z.object({
    recipeId: z.string().optional().describe("The ID of the chosen recipe from the provided list. Required if isNew is false."),
    isNew: z.boolean().describe("Set to true if this is a newly generated recipe NOT in the provided list."),
    newRecipeDetails: GeneratedRecipeDetailSchema.optional().describe("Complete details of the new recipe. Required ONLY if isNew is true."),
    
    day: z.number().int().min(1).describe("The day number in the plan (1 to duration)."),
    meal: z.enum(['Midi', 'Soir']).describe("The meal slot, either 'Midi' (Lunch) or 'Soir' (Dinner)."),
    mealType: z.enum(['Entrée', 'Plat Principal', 'Dessert']).describe("The type of meal."),
});

const GeneratePlanningOutputSchema = z.object({
    eventName: z.string().describe("A descriptive name for the generated event (e.g., 'Semaine Végétarienne')."),
    meals: z.array(PlannedMealSchema).describe("The list of planned meals. MUST cover all days from 1 to duration."),
});
export type GeneratePlanningOutput = z.infer<typeof GeneratePlanningOutputSchema>;

// Create the flow
const generatePlanningFlow = ai.defineFlow(
  {
    name: 'generatePlanningFlow',
    inputSchema: GeneratePlanningInputSchema,
    outputSchema: GeneratePlanningOutputSchema,
  },
  async ({ recipes, duration, constraints }) => {
    const availableRecipesJson = JSON.stringify(recipes.map(r => ({ id: r.id, title: r.title, description: r.description, category: r.category })));
    
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        system: `Tu es un expert en planification de repas. Ta mission est de créer un planning équilibré, logique et varié.
        Tu dois TOUJOURS répondre en FRANÇAIS, y compris pour les titres et descriptions des nouvelles recettes.

        RÈGLES CRITIQUES :
        1. **COUVERTURE :** Tu DOIS générer des repas pour CHAQUE jour du Jour 1 au Jour ${duration}.
        2. **STRUCTURE :** Chaque jour DOIT avoir au moins un 'Plat Principal' pour le 'Midi' ET le 'Soir'.
        3. **LOGIQUE :** Évite de répéter le même plat principal. Varie les plaisirs.
        4. **RECETTES :** 
           - Utilise en priorité les recettes de la liste 'Available Recipes' si elles correspondent aux contraintes : "${constraints}".
           - Si tu dois créer une recette (isNew: true), fais-le en FRANÇAIS avec tous les détails (newRecipeDetails).
        5. **CONTRAINTES :** Respecte strictement les envies : "${constraints}".
        `,
        prompt: `Recettes disponibles : ${availableRecipesJson}
        
        Génère maintenant le planning complet de ${duration} jours en FRANÇAIS.`,
        output: { schema: GeneratePlanningOutputSchema },
      });

      if (!output) {
        throw new Error('L\'IA a retourné un résultat de planning vide.');
      }

      return output;
    } catch (error) {
      console.error('Erreur planning Genkit:', error);
      throw error;
    }
  }
);


// Exported function to be called from the client
export async function generatePlanning(input: GeneratePlanningInput): Promise<GeneratePlanningOutput> {
  return await generatePlanningFlow(input);
}
