'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRecipes } from '@/context/recipe-context';
import { useSettings } from '@/context/settings-context';
import { generateRecipe } from '@/ai/flows/generate-recipe-flow';
import { generateMenu } from '@/ai/flows/generate-menu-flow';
import type { Recipe } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function GeneratorPage() {
  const router = useRouter();
  const { setGeneratedRecipe, setGeneratedMenu } = useRecipes();
  const { systemPrompt } = useSettings();
  const [request, setRequest] = useState('');
  const [menuRequest, setMenuRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateRecipe = async () => {
    if (!request.trim()) {
      toast({
        variant: 'destructive',
        title: 'La description est vide',
        description: 'Veuillez décrire la recette que vous souhaitez générer.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateRecipe({ userInput: request, systemPrompt });

      // Create a partial recipe object for the form
      const generatedData: Partial<Recipe> = {
        title: result.title || '',
        description: result.description || '',
        category: result.category || 'Plat Principal',
        prepTime: result.prepTime || 0,
        cookTime: result.cookTime || 0,
        servings: result.servings || 2,
        ingredients: result.ingredients || [],
        steps: result.steps || [],
        imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
        imageHint: result.title ? result.title.toLowerCase().split(' ').slice(0,2).join(' ') : 'food plate',
      };
      
      // Store the generated recipe in context to be picked up by the new recipe page
      setGeneratedRecipe(generatedData);
      
      toast({
        title: 'Recette générée !',
        description: 'Vérifiez et modifiez les informations ci-dessous avant d\'enregistrer.',
      });

      router.push('/recipes/new'); // Navigate to the form page
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: "L'IA n'a pas pu générer de recette. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMenu = async () => {
      if (!menuRequest.trim()) {
        toast({
          variant: 'destructive',
          title: 'La description est vide',
          description: 'Veuillez décrire le menu que vous souhaitez générer.',
        });
        return;
      }
      setIsLoading(true);
      try {
        const result = await generateMenu({ userInput: menuRequest, systemPrompt });
  
        const generatedRecipes: Partial<Recipe>[] = result.recipes.map(r => ({
            title: r.title || '',
            description: r.description || '',
            category: r.category || 'Plat Principal',
            prepTime: r.prepTime || 0,
            cookTime: r.cookTime || 0,
            servings: r.servings || 2,
            ingredients: r.ingredients || [],
            steps: r.steps || [],
            imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
            imageHint: r.title ? r.title.toLowerCase().split(' ').slice(0,2).join(' ') : 'food plate',
        }));
        
        // Store the generated menu in context
        setGeneratedMenu(generatedRecipes);
        
        toast({
          title: 'Menu généré !',
          description: 'Vous pouvez maintenant voir les recettes générées.',
        });
  
        router.push('/recipes/new-menu'); // Navigate to a new page for reviewing the menu (need to create this)
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erreur de génération',
          description: "L'IA n'a pas pu générer de menu. Veuillez réessayer.",
        });
      } finally {
        setIsLoading(false);
      }
    };


  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="animate-in fade-in-50 duration-500">
        <CardHeader>
          <CardTitle className="font-serif text-3xl flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Générateur IA
          </CardTitle>
          <CardDescription>
            Utilisez l'intelligence artificielle pour créer de nouvelles recettes ou des menus complets.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="recipe" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recipe">Recette Unique</TabsTrigger>
                    <TabsTrigger value="menu">Menu Complet</TabsTrigger>
                </TabsList>
                <TabsContent value="recipe" className="space-y-4 mt-4">
                     <p className="text-sm text-muted-foreground">
                        Décrivez la recette que vous aimeriez créer. Soyez aussi simple ou détaillé que vous le souhaitez.
                    </p>
                    <Textarea
                        placeholder="Ex: Un plat de pâtes rapide avec du poulet et des épinards, style méditerranéen..."
                        rows={5}
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        disabled={isLoading}
                        className="text-base"
                    />
                    <Button onClick={handleGenerateRecipe} disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? (
                        <Loader2 className="animate-spin" />
                        ) : (
                        <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Générer la recette
                        </>
                        )}
                    </Button>
                </TabsContent>
                <TabsContent value="menu" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                        Décrivez le menu que vous aimeriez créer (Entrée, Plat, Dessert, etc.).
                    </p>
                    <Textarea
                        placeholder="Ex: Un menu italien complet pour 4 personnes avec entrée, plat et dessert..."
                        rows={5}
                        value={menuRequest}
                        onChange={(e) => setMenuRequest(e.target.value)}
                        disabled={isLoading}
                        className="text-base"
                    />
                    <Button onClick={handleGenerateMenu} disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? (
                        <Loader2 className="animate-spin" />
                        ) : (
                        <>
                            <Utensils className="mr-2 h-5 w-5" />
                            Générer le menu
                        </>
                        )}
                    </Button>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
