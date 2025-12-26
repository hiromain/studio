
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRecipes } from '@/context/recipe-context';
import { usePlanning } from '@/context/planning-context';
import { RecipeCard } from '@/components/recipe-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  CalendarDays, 
  ShoppingCart, 
  Sparkles, 
  ArrowRight, 
  Utensils, 
  Clock,
  Plus,
  UtensilsCrossed
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const MESSAGES = [
  "Ton coin Miam-Miam",
  "Le temple du Grignotage",
  "L'antre de la Gourmandise",
  "Ton grimoire à Festins",
  "Le QG des Papilles",
  "Ta cuisine, tes Règles",
  "Le paradis des Gloutons",
  "Tes recettes secrètes (chut !)",
  "L'atelier des Saveurs",
  "Ton futur Chef-d'œuvre",
  "Le labo des Délices",
  "Tes pépites Culinaires",
  "La fabrique à Souvenirs",
  "Ton carnet Gourmand",
  "L'escale des Saveurs",
  "Tes envies du Moment",
  "La caverne d'Ali Baba (version Food)",
  "Ton répertoire à Régalades",
  "Le repaire des Fins Gourmets",
  "Tes créations qui Déchirent",
  "Le jardin des Délices",
  "Ton menu de Ministre",
  "L'académie du Goût",
  "Tes plats Signature",
  "Le coin des Bons Vivants",
  "Ton inspiration Quotidienne",
  "La cuisine du Bonheur",
  "Tes petits Plats Maison",
  "Le palais de la Gastronomie",
  "Ton escapade Gustative",
  "La bibliothèque du Miam",
  "Tes recettes de Légende",
  "Le sanctuaire du Goût",
  "Ton festival de Saveurs",
  "La machine à Régaler",
  "Tes idées les plus Folles",
  "Le bastion de la Cuisine",
  "Ton refuge Gourmand",
  "L'arène des Fourneaux",
  "Tes pépites de Chef",
  "La source de l'Inspiration",
  "Ton carnet de Voyage Culinaire",
  "Le théâtre des Papilles",
  "Tes secrets de Grand-Mère",
  "La mine d'Or du Goût",
  "Ton cocktail de Recettes",
  "L'orchestre des Marmites",
  "Tes délices de Saison",
  "La magie des Épices",
  "Ton univers Croquant"
];

export default function HomePage() {
  const { recipes } = useRecipes();
  const { plannedEvents, getPlanForDate } = usePlanning();
  const [randomMessage, setRandomMessage] = useState("Ton coin Miam-Miam");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const randomIndex = Math.floor(Math.random() * MESSAGES.length);
    setRandomMessage(MESSAGES[randomIndex]);
  }, []);

  // --- Logic: Today's Meal ---
  const today = new Date();
  const todaysPlan = useMemo(() => {
    const activeEvent = plannedEvents.find(e => {
        const start = parseISO(e.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + e.duration);
        return today >= start && today <= end;
    });

    if (!activeEvent) return null;

    const plans = getPlanForDate(today, activeEvent.id);
    if (plans.length === 0) return null;

    return { event: activeEvent, plans };
  }, [plannedEvents, getPlanForDate, today]);

  // --- Logic: Recent Recipes ---
  const recentRecipes = useMemo(() => {
    return [...recipes].reverse().slice(0, 4);
  }, [recipes]);

  if (!mounted) return null;

  return (
    <div className="container mx-auto py-8 space-y-12 animate-in fade-in duration-700">
      
      {/* --- HERO SECTION --- */}
      <section className="relative rounded-3xl overflow-hidden bg-primary/5 border border-primary/10 p-8 sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-background px-3 py-1 text-sm font-medium text-primary shadow-sm">
                <ChefHat className="mr-2 h-4 w-4" />
                <span>On cuisine quoi aujourd&apos;hui ?</span>
            </div>
            <h1 className="text-4xl font-serif font-bold tracking-tight sm:text-6xl text-foreground">
                {randomMessage.split(' ').map((word, i, arr) => (
                    <span key={i}>
                        {i === arr.length - 1 ? <span className="text-primary">{word}</span> : word}
                        {i < arr.length - 1 ? ' ' : ''}
                    </span>
                ))}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
                Gère tes pépites culinaires, planifie tes festins et génère ta liste de courses sans te prendre le chou.
            </p>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start pt-4">
                <Button asChild size="lg" className="rounded-full shadow-lg font-bold h-14 px-8 text-lg">
                    <Link href="/recettes/nouvelle">
                        <Plus className="mr-2 h-5 w-5" /> Créer une recette
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full border-primary/20 bg-background hover:bg-primary/5 h-14 px-8 text-lg">
                    <Link href="/generateur">
                        <Sparkles className="mr-2 h-5 w-5 text-primary" /> Magie de l&apos;IA
                    </Link>
                </Button>
            </div>
        </div>
        
        {/* Today's Focus Widget */}
        <div className="hidden lg:block relative w-72 h-72">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse" />
             <div className="relative bg-card border border-border/50 shadow-2xl rounded-[2rem] p-8 rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
                <div className="flex items-center gap-4 mb-6 border-b border-border/50 pb-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Aujourd&apos;hui</p>
                        <p className="font-serif font-bold text-xl">{format(today, 'd MMMM', { locale: fr })}</p>
                    </div>
                </div>
                {todaysPlan ? (
                    <div className="space-y-4">
                         <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold">AU MENU</Badge>
                         <p className="font-bold text-lg leading-tight line-clamp-2">
                            {todaysPlan.plans[0].recipes[0] 
                                ? recipes.find(r => r.id === todaysPlan.plans[0].recipes[0].recipeId)?.title 
                                : "Un bon petit plat"}
                         </p>
                         <Button asChild size="sm" variant="ghost" className="w-full justify-between hover:bg-primary/5 group p-0 h-auto font-bold text-primary">
                            <Link href={`/planning/evenements/${todaysPlan.event.id}`}>
                                Voir le planning <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                         </Button>
                    </div>
                ) : (
                    <div className="text-center py-4 space-y-4">
                        <p className="text-muted-foreground italic font-medium">Rien de prévu pour ce soir...</p>
                        <Button asChild size="sm" className="w-full rounded-xl font-bold shadow-md">
                            <Link href="/planning">Organiser</Link>
                        </Button>
                    </div>
                )}
             </div>
        </div>
      </section>

      {/* --- QUICK ACCESS GRID --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/recettes" className="group">
            <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-[2rem] overflow-hidden">
                <div className="h-2 bg-primary" />
                <CardHeader className="pt-8">
                    <CardTitle className="flex items-center gap-4 font-serif text-3xl">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                            <Utensils className="h-7 w-7" />
                        </div>
                        Mes Recettes
                    </CardTitle>
                    <CardDescription className="text-base pt-2">
                        Explore ta collection de {recipes.length} pépites culinaires.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <div className="flex items-center text-sm font-black text-primary uppercase tracking-wider">
                        Accéder <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>

        <Link href="/planning" className="group">
            <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-[2rem] overflow-hidden">
                <div className="h-2 bg-accent" />
                <CardHeader className="pt-8">
                    <CardTitle className="flex items-center gap-4 font-serif text-3xl">
                         <div className="p-3 rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                            <CalendarDays className="h-7 w-7" />
                        </div>
                        Planning
                    </CardTitle>
                    <CardDescription className="text-base pt-2">
                        {plannedEvents.length > 0 ? `${plannedEvents.length} événements prévus.` : "Organise tes prochains repas."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                     <div className="flex items-center text-sm font-black text-accent uppercase tracking-wider">
                        Calendrier <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>

        <Link href="/liste-courses" className="group">
            <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-[2rem] overflow-hidden">
                <div className="h-2 bg-blue-500" />
                <CardHeader className="pt-8">
                    <CardTitle className="flex items-center gap-4 font-serif text-3xl">
                         <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                            <ShoppingCart className="h-7 w-7" />
                        </div>
                        Courses
                    </CardTitle>
                    <CardDescription className="text-base pt-2">
                        Génère ta liste et fais tes emplettes sans rien oublier.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                     <div className="flex items-center text-sm font-black text-blue-500 uppercase tracking-wider">
                        Ma liste <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </Link>
      </section>

      {/* --- RECENT ADDITIONS --- */}
      {recipes.length > 0 && (
        <section className="space-y-8 pt-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
                        <Clock className="h-8 w-8 text-primary" />
                        Derniers ajouts
                    </h2>
                    <p className="text-muted-foreground">Tes créations les plus récentes</p>
                </div>
                <Button asChild variant="ghost" className="hidden sm:flex rounded-full font-bold hover:bg-primary/5">
                    <Link href="/recettes">Tout voir <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recentRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>
            
             <Button asChild variant="outline" className="w-full sm:hidden rounded-full h-12 font-bold border-2">
                <Link href="/recettes text-lg">Voir toute ma collection</Link>
            </Button>
        </section>
      )}

      {/* --- EMPTY STATE --- */}
      {recipes.length === 0 && (
        <div className="text-center py-24 bg-card rounded-[3rem] border-2 border-dashed border-muted-foreground/20 shadow-inner animate-in zoom-in duration-500">
             <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
             </div>
             <h3 className="text-3xl font-serif font-bold mb-3">Ton grimoire est vide !</h3>
             <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg">
                Commence par ajouter tes plats signatures ou laisse la magie de l&apos;IA t&apos;inspirer.
             </p>
             <Button asChild size="lg" className="rounded-full px-12 h-14 text-lg font-bold shadow-xl">
                <Link href="/generateur">Générer avec l&apos;IA ✨</Link>
             </Button>
        </div>
      )}

    </div>
  );
}
