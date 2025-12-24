'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Trash2 } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NewMenuPage() {
  const router = useRouter();
  const { generatedMenu, addRecipe, setGeneratedMenu } = useRecipes();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localMenu, setLocalMenu] = useState<Partial<Recipe>[]>([]);

  useEffect(() => {
    if (generatedMenu) {
      setLocalMenu(generatedMenu);
    } else {
      // Redirect if no menu data is found
      router.push('/generator');
    }
  }, [generatedMenu, router]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      let savedCount = 0;
      for (const recipe of localMenu) {
        // Ensure required fields are present
         if (recipe.title && recipe.ingredients && recipe.steps) {
            await addRecipe(recipe as Omit<Recipe, 'id'>);
            savedCount++;
         }
      }

      toast({
        title: 'Menu enregistré !',
        description: `${savedCount} recettes ont été ajoutées à votre collection.`,
      });
      
      setGeneratedMenu(null); // Clear the generated menu
      router.push('/'); // Go back to home
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement du menu.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveRecipe = (index: number) => {
      const newMenu = [...localMenu];
      newMenu.splice(index, 1);
      setLocalMenu(newMenu);
  };

  if (!localMenu || localMenu.length === 0) {
    return (
        <div className="flex h-screen items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-serif font-bold">Revue du Menu Généré</h1>
        <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Tout Enregistrer
        </Button>
      </div>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          {localMenu.map((recipe, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                    <div className="font-semibold text-lg">{recipe.title || 'Recette sans titre'}</div>
                    <Badge variant="secondary">{recipe.category}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-0 shadow-none">
                    <CardHeader className="px-0">
                        <CardDescription>{recipe.description}</CardDescription>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                            <span>Préparation: {recipe.prepTime} min</span>
                            <span>Cuisson: {recipe.cookTime} min</span>
                            <span>Portions: {recipe.servings}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Ingrédients</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    {recipe.ingredients?.map((ing, i) => (
                                        <li key={i}>{ing.quantity} {ing.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Étapes</h4>
                                <ol className="list-decimal pl-5 space-y-2 text-sm">
                                    {recipe.steps?.map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveRecipe(index)}>
                                <Trash2 className="h-4 w-4 mr-2"/>
                                Retirer du menu
                            </Button>
                        </div>
                    </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
