'use server';
/**
 * @fileOverview Flow to import recipes from a URL or a photo.
 *
 * - importRecipeFromUrl - Imports a recipe from a given URL.
 * - importRecipeFromPhoto - Imports a recipe from a photo.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConfidenceSchema = z.object({
    value: z.any(),
    confidence: z.number().min(0).max(1).describe('A confidence score from 0.0 to 1.0 on the accuracy of the extracted value.'),
    justification: z.string().describe('A brief justification for why this value was extracted and what the confidence level is.')
});

// Define input schemas
const UrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the recipe page.'),
});
export type UrlInput = z.infer<typeof UrlInputSchema>;


const PhotoInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a recipe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type PhotoInput = z.infer<typeof PhotoInputSchema>;

const ImportedRecipeOutputSchema = z.object({
    title: ConfidenceSchema.extend({ value: z.string() }).optional(),
    description: ConfidenceSchema.extend({ value: z.string() }).optional(),
    category: ConfidenceSchema.extend({ value: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']) }).optional(),
    prepTime: ConfidenceSchema.extend({ value: z.number() }).optional(),
    cookTime: ConfidenceSchema.extend({ value: z.number() }).optional(),
    servings: ConfidenceSchema.extend({ value: z.number() }).optional(),
    ingredients: ConfidenceSchema.extend({ value: z.array(z.object({ name: z.string(), quantity: z.string()})) }).optional(),
    steps: ConfidenceSchema.extend({ value: z.array(z.string()) }).optional(),
}).partial();
export type ImportedRecipeOutput = z.infer<typeof ImportedRecipeOutputSchema>;


// Create prompts
const urlPrompt = ai.definePrompt({
  name: 'importRecipeFromUrlPrompt',
  input: { schema: UrlInputSchema },
  output: { schema: ImportedRecipeOutputSchema },
  prompt: `You are an expert recipe scraper. Scrape the recipe from the provided URL.
For each field, you must provide the extracted value, a confidence score (0.0 to 1.0) and a brief justification.
- Confidence 1.0: The data is clearly labelled and extracted.
- Confidence 0.5-0.9: The data is inferred from context or has minor ambiguity.
- Confidence < 0.5: The data is a wild guess or not found.
If a value is not found, do not include the field in the output.

URL: {{{url}}}`,
});

const photoPrompt = ai.definePrompt({
  name: 'importRecipeFromPhotoPrompt',
  input: { schema: PhotoInputSchema },
  output: { schema: ImportedRecipeOutputSchema },
  prompt: `You are an expert recipe transcriber. Extract the recipe details from the provided image.
For each field, you must provide the extracted value, a confidence score (0.0 to 1.0) and a brief justification.
- Confidence 1.0: The data is clearly visible and readable.
- Confidence 0.5-0.9: The data is inferred, slightly blurry, or has minor ambiguity.
- Confidence < 0.5: The data is a wild guess, unreadable, or not found.
If a value is not found, do not include the field in the output.

Photo: {{media url=photoDataUri}}`,
});

// Create flows
const importFromUrlFlow = ai.defineFlow(
  {
    name: 'importFromUrlFlow',
    inputSchema: UrlInputSchema,
    outputSchema: ImportedRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await urlPrompt(input);
    return output ?? {};
  }
);

const importFromPhotoFlow = ai.defineFlow(
  {
    name: 'importFromPhotoFlow',
    inputSchema: PhotoInputSchema,
    outputSchema: ImportedRecipeOutputSchema,
  },
  async (input) => {
    const { output } = await photoPrompt(input);
    return output ?? {};
  }
);

// Exported functions to be called from the client
export async function importRecipeFromUrl(input: UrlInput): Promise<ImportedRecipeOutput> {
  return await importFromUrlFlow(input);
}

export async function importRecipeFromPhoto(input: PhotoInput): Promise<ImportedRecipeOutput> {
  return await importFromPhotoFlow(input);
}
