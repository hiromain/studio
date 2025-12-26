'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipes } from '@/context/recipe-context';
import { usePlanning } from '@/context/planning-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Trash2, CalendarRange } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NewMenuPage() {
  const router = useRouter();
  const { generatedMenu, addRecipe, setGeneratedMenu } = useRecipes();
  const { addEvent, addRecipeToPlan } = usePlanning();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localMenu, setLocalMenu] = useState<Partial<Recipe>[]>([]);
  
  // Planning dialog state
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [planName, setPlanName] = useState('Menu de fête');
  const [planDate, setPlanDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (generatedMenu) {
      setLocalMenu(generatedMenu);
      // Try to set a default name from the first recipe or something generic
      if (generatedMenu.length > 0) {
          setPlanName(`Menu ${generatedMenu[0].title || 'Gourmand'}`);
      }
    } else {
      router.push('/generateur');
    }
  }, [generatedMenu, router]);

  const saveRecipes = async () => {
    const savedRecipes: Recipe[] = [];
    for (const recipe of localMenu) {
      if (recipe.title && recipe.ingredients && recipe.steps) {
        const saved = await addRecipe(recipe as Omit<Recipe, 'id'>);
        savedRecipes.push(saved);
      }
    }
    return savedRecipes;
  };

  const handleSaveOnly = async () => {
    setIsSaving(true);
    try {
      const saved = await saveRecipes();
      toast({
        title: 'Menu enregistré !',
        description: `${saved.length} recettes ont été ajoutées à votre collection.`,
      });
      setGeneratedMenu(null);
      router.push('/recettes');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Erreur lors de l'enregistrement." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndPlan = async () => {
    setIsSaving(true);
    try {
      // 1. Save all recipes
      const savedRecipes = await saveRecipes();
      
      // 2. Create a 1-day event
      const startDate = new Date(planDate);
      const newEvent = addEvent(planName, startDate, 1);
      
      // 3. Add recipes to the plan for Day 1
      // We'll try to guess the slot based on index or category
      for (let i = 0; i < savedRecipes.length; i++) {
        const recipe = savedRecipes[i];
        let slot: 'Midi' | 'Soir' = i < 2 ? 'Midi' : 'Soir'; // Simple heuristic
        
        // If it's a dessert and we have many recipes, put it at the end of a slot
        // For this simple "Save & Plan", let's just put them all on the same day
        addRecipeToPlan(startDate, slot, recipe.id, recipe.category as any, newEvent.id);
      }

      toast({
        title: 'Menu Planifié ! ✨',
        description: `Les recettes ont été créées et ajoutées à "${planName}".`,
      });
      
      setGeneratedMenu(null);
      router.push(`/planning/evenements/${newEvent.id}`);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Erreur lors de la planification." });
    } finally {
      setIsSaving(false);
      setIsPlanDialogOpen(false);
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
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-serif font-bold">Ton Nouveau Menu</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveOnly} disabled={isSaving}>
                Enregistrer
            </Button>
            
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isSaving} className="gap-2 shadow-lg">
                        <CalendarRange className="h-4 w-4" />
                        Planifier ce menu
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Planifier ce menu</DialogTitle>
                        <DialogDescription>
                            Cela créera un événement d'un jour et y ajoutera automatiquement toutes ces recettes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom de l'événement</Label>
                            <Input id="name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveAndPlan} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirmer et Planifier
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={localMenu.map((_, i) => `item-${i}`)} className="w-full">
          {localMenu.map((recipe, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border bg-card rounded-xl px-4 mb-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                    <div className="font-semibold text-lg">{recipe.title || 'Recette sans titre'}</div>
                    <Badge variant="secondary">{recipe.category}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-4 pt-2">
                    <p className="text-muted-foreground italic">{recipe.description}</p>
                    <div className="flex gap-4 text-sm font-medium">
                        <span className="bg-primary/5 px-2 py-1 rounded">⏲️ {recipe.prepTime + (recipe.cookTime || 0)} min</span>
                        <span className="bg-primary/5 px-2 py-1 rounded">👥 {recipe.servings} pers.</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <span className="text-primary text-xs">●</span> Ingrédients
                            </h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {recipe.ingredients?.map((ing, i) => (
                                    <li key={i}>{ing.quantity} {ing.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <span className="text-primary text-xs">●</span> Étapes
                            </h4>
                            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
                                {recipe.steps?.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-dashed">
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveRecipe(index)}>
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Retirer ce plat
                        </Button>
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
