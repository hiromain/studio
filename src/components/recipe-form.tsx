"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import type { Recipe, Confidence } from '@/lib/types';
import { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ingredientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  quantity: z.string().min(1, "La quantité est requise."),
});

const recipeSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères."),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  category: z.enum(['Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Apéritif', 'Autre']),
  prepTime: z.coerce.number().min(0, "Le temps doit être un nombre positif."),
  cookTime: z.coerce.number().min(0, "Le temps doit être un nombre positif."),
  servings: z.coerce.number().min(1, "Les portions doivent être d'au moins 1."),
  ingredients: z.array(ingredientSchema).min(1, "Ajoutez au moins un ingrédient."),
  steps: z.array(z.string().min(5, "L'étape doit contenir au moins 5 caractères.")).min(1, "Ajoutez au moins une étape."),
  imageUrl: z.string().url("Veuillez entrer une URL d'image valide."),
  imageHint: z.string().min(2, "Veuillez entrer un indice pour l'image."),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

type ImportedData = {
    [K in keyof Recipe]?: Confidence<Recipe[K]>;
} & { id?: string };


interface RecipeFormProps {
  initialData?: Recipe | Partial<Recipe> | ImportedData;
}

const getConfidenceClass = (score: number) => {
  if (score > 0.9) return 'border-green-500/80 focus-visible:ring-green-500';
  if (score > 0.5) return 'border-yellow-500/80 focus-visible:ring-yellow-500';
  return 'border-orange-500/80 focus-visible:ring-orange-500';
};

const ConfidenceTooltip = ({ justification }: { justification: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
            <p>{justification}</p>
        </TooltipContent>
    </Tooltip>
)

export function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const { addRecipe, updateRecipe } = useRecipes();
  const { toast } = useToast();

  const isEditMode = !!(initialData as Recipe)?.id && !(initialData as ImportedData)?.title?.confidence;

  const processInitialData = (data?: Recipe | Partial<Recipe> | ImportedData) => {
    if (!data || Object.keys(data).length === 0) {
        return {
          title: '', description: '', category: 'Plat Principal' as const, prepTime: 0, cookTime: 0, servings: 1,
          ingredients: [{ id: 'new-0', name: '', quantity: '' }], steps: [''], imageUrl: 'https://picsum.photos/seed/9/600/400', imageHint: 'food plate',
        };
    }
    
    // Check if it's imported data with confidence scores
    if ((data as ImportedData)?.title?.confidence !== undefined) {
        const imported = data as ImportedData;
        return {
            title: imported.title?.value || '',
            description: imported.description?.value || '',
            category: imported.category?.value || 'Plat Principal',
            prepTime: imported.prepTime?.value || 0,
            cookTime: imported.cookTime?.value || 0,
            servings: imported.servings?.value || 1,
            ingredients: imported.ingredients?.value?.map((i, idx) => ({ ...i, id: `new-${idx}` })) || [{ id: 'new-0', name: '', quantity: '' }],
            steps: imported.steps?.value || [''],
            imageUrl: 'https://picsum.photos/seed/9/600/400',
            imageHint: imported.title?.value ? imported.title.value.toLowerCase().split(' ').slice(0,2).join(' ') : 'food plate',
        }
    }
    
    // It's a standard Recipe object for editing
    const recipeData = data as Recipe;
    return {
      ...recipeData,
      ingredients: recipeData.ingredients?.map(i => ({...i, id: i.id || `new-${Math.random()}`})) || [{ id: 'new-0', name: '', quantity: '' }],
      steps: recipeData.steps?.length ? recipeData.steps : [''],
      imageUrl: recipeData.imageUrl || 'https://picsum.photos/seed/9/600/400',
      imageHint: recipeData.imageHint || 'food plate',
    }
  }

  const defaultValues = processInitialData(initialData);
  
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues,
    mode: "onChange",
  });
  
  useEffect(() => {
    if (initialData) {
      form.reset(processInitialData(initialData));
    }
  }, [initialData, form]);


  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients"
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "steps"
  });
  
  function onSubmit(data: RecipeFormValues) {
    if (isEditMode && (initialData as Recipe).id) {
      updateRecipe({ ...data, id: (initialData as Recipe).id });
      toast({ title: "Recette modifiée!", description: "La recette a été mise à jour avec succès." });
      router.push(`/recettes/${(initialData as Recipe).id}`);
    } else {
      const newRecipe = addRecipe(data);
      toast({ title: "Recette ajoutée!", description: "Votre nouvelle recette est prête." });
      router.push(`/recettes/${newRecipe.id}`);
    }
  }

  const importedConfidences = initialData && (initialData as ImportedData)?.title?.confidence !== undefined ? initialData as ImportedData : null;

  return (
    <TooltipProvider>
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader><CardTitle className="text-2xl font-serif">{isEditMode ? 'Modifier la recette' : 'Ajouter une nouvelle recette'}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Titre</FormLabel>
                        {importedConfidences?.title && <ConfidenceTooltip justification={importedConfidences.title.justification} />}
                    </div>
                    <FormControl>
                        <Input 
                            placeholder="Ex: Gâteau au chocolat" {...field}
                            className={cn(importedConfidences?.title && getConfidenceClass(importedConfidences.title.confidence))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Description</FormLabel>
                        {importedConfidences?.description && <ConfidenceTooltip justification={importedConfidences.description.justification} />}
                    </div>
                    <FormControl>
                        <Textarea 
                            placeholder="Une brève description de la recette..." {...field}
                            className={cn(importedConfidences?.description && getConfidenceClass(importedConfidences.description.confidence))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Catégorie</FormLabel>
                        {importedConfidences?.category && <ConfidenceTooltip justification={importedConfidences.category.justification} />}
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger className={cn(importedConfidences?.category && getConfidenceClass(importedConfidences.category.confidence))}>
                            <SelectValue placeholder="Choisissez une catégorie" />
                        </SelectTrigger>
                    </FormControl>
                  <SelectContent>
                    {['Apéritif', 'Entrée', 'Plat Principal', 'Dessert', 'Boisson', 'Autre'].map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="prepTime" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Préparation (min)</FormLabel>
                        {importedConfidences?.prepTime && <ConfidenceTooltip justification={importedConfidences.prepTime.justification} />}
                    </div>
                    <FormControl><Input type="number" {...field} className={cn(importedConfidences?.prepTime && getConfidenceClass(importedConfidences.prepTime.confidence))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cookTime" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Cuisson (min)</FormLabel>
                        {importedConfidences?.cookTime && <ConfidenceTooltip justification={importedConfidences.cookTime.justification} />}
                    </div>
                    <FormControl><Input type="number" {...field} className={cn(importedConfidences?.cookTime && getConfidenceClass(importedConfidences.cookTime.confidence))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="servings" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Portions</FormLabel>
                        {importedConfidences?.servings && <ConfidenceTooltip justification={importedConfidences.servings.justification} />}
                    </div>
                    <FormControl><Input type="number" {...field} className={cn(importedConfidences?.servings && getConfidenceClass(importedConfidences.servings.confidence))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
               <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem><FormLabel>URL de l'image</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="imageHint" render={({ field }) => (
                  <FormItem><FormLabel>Indice de l'image</FormLabel><FormControl><Input placeholder="Ex: chocolate cake" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <div className="flex items-center">
                    <CardTitle>Ingrédients</CardTitle>
                    {importedConfidences?.ingredients && <ConfidenceTooltip justification={importedConfidences.ingredients.justification} />}
                </div>
            </CardHeader>
            <CardContent className={cn("space-y-4", importedConfidences?.ingredients && getConfidenceClass(importedConfidences.ingredients.confidence), "border rounded-md p-4")}>
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel className={index !== 0 ? 'sr-only' : ''}>Quantité</FormLabel><FormControl><Input placeholder="Ex: 200g" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`ingredients.${index}.name`} render={({ field }) => (
                    <FormItem className="flex-[2]"><FormLabel className={index !== 0 ? 'sr-only' : ''}>Nom</FormLabel><FormControl><Input placeholder="Ex: Farine" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeIngredient(index)} disabled={ingredientFields.length <= 1}>
                    <Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer l'ingrédient</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient({ id: `new-${Date.now()}`, name: '', quantity: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un ingrédient
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <div className="flex items-center">
                    <CardTitle>Étapes de préparation</CardTitle>
                    {importedConfidences?.steps && <ConfidenceTooltip justification={importedConfidences.steps.justification} />}
                </div>
            </CardHeader>
            <CardContent className={cn("space-y-4", importedConfidences?.steps && getConfidenceClass(importedConfidences.steps.confidence), "border rounded-md p-4")}>
              {stepFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <span className="pt-2 text-lg font-bold text-primary">{index + 1}.</span>
                  <FormField control={form.control} name={`steps.${index}`} render={({ field }) => (
                    <FormItem className="flex-1"><FormLabel className="sr-only">Étape {index + 1}</FormLabel><FormControl><Textarea placeholder="Décrivez l'étape..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeStep(index)} disabled={stepFields.length <= 1}>
                    <Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer l'étape</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendStep('')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une étape
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
             <Button type="submit" disabled={form.formState.isSubmitting}>
               {isEditMode ? 'Mettre à jour la recette' : 'Enregistrer la recette'}
             </Button>
          </div>
        </form>
      </Form>
    </div>
    </TooltipProvider>
  );
}
