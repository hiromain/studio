
"use client";

import { useRecipes } from '@/context/recipe-context';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  UtensilsCrossed, 
  ArrowLeft, 
  ExternalLink, 
  Search, 
  Filter, 
  Clock, 
  Users,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { RecipeCard } from '@/components/recipe-card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecipesManagementPage() {
  const { recipes, deleteRecipe, isLoading } = useRecipes();
  const router = useRouter();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [maxTime, setMaxTime] = useState(240);
  const [minServings, setMinServings] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(recipes.map(r => r.category)))];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter;
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      const matchesTime = totalTime <= maxTime;
      const matchesServings = (recipe.servings || 0) >= minServings;

      return matchesSearch && matchesCategory && matchesTime && matchesServings;
    });
  }, [recipes, searchTerm, categoryFilter, maxTime, minServings]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button onClick={() => router.push('/')} variant="ghost" className="mb-2 -ml-2 hover:bg-primary/10 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Button>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">Ma Collection</h1>
          <p className="text-muted-foreground mt-1">Organise et explore tes {recipes.length} pépites culinaires.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="hidden sm:block">
                <TabsList className="rounded-full">
                    <TabsTrigger value="grid" className="rounded-full"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
                    <TabsTrigger value="table" className="rounded-full"><List className="h-4 w-4" /></TabsTrigger>
                </TabsList>
            </Tabs>
            <Button asChild className="flex-1 sm:flex-none rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all font-bold">
                <Link href="/recettes/nouvelle">
                    <Plus className="mr-2 h-5 w-5" /> Ajouter
                </Link>
            </Button>
        </div>
      </div>

      {/* Advanced Search Section */}
      <div className="space-y-4">
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un plat, un ingrédient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary text-lg"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-14 rounded-2xl bg-muted/50 border-none text-base font-medium">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize py-3">
                      {cat === 'all' ? 'Toutes les envies' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="h-14 rounded-2xl px-6 border-dashed border-2 hover:bg-primary/5 hover:text-primary transition-colors font-bold">
                  <Filter className="mr-2 h-5 w-5" />
                  {isAdvancedOpen ? 'Fermer' : 'Filtres'}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="px-6 pb-8 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Temps maximum
                  </Label>
                  <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{formatDuration(maxTime)}</span>
                </div>
                <Slider
                  min={5}
                  max={240}
                  step={5}
                  value={[maxTime]}
                  onValueChange={(val) => setMaxTime(val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>5 min</span>
                    <span>120 min</span>
                    <span>4h+</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Nombre de gourmands
                  </Label>
                  <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{minServings}+ personnes</span>
                </div>
                <Slider
                  min={1}
                  max={12}
                  step={1}
                  value={[minServings]}
                  onValueChange={(val) => setMinServings(val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Solo</span>
                    <span>Famille</span>
                    <span>Grande tablée</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {filteredRecipes.length > 0 ? (
        viewMode === 'table' ? (
          <div className="bg-card rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                  <TableHead className="w-[80px] py-6 px-6">Image</TableHead>
                  <TableHead className="py-6 px-6">Titre</TableHead>
                  <TableHead className="py-6 px-6 hidden md:table-cell">Catégorie</TableHead>
                  <TableHead className="py-6 px-6 hidden sm:table-cell">Temps total</TableHead>
                  <TableHead className="py-6 px-6 hidden lg:table-cell">Portions</TableHead>
                  <TableHead className="text-right py-6 px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                    <TableCell className="py-4 px-6">
                      <Link href={`/recettes/${recipe.id}`}>
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform">
                          <Image
                              src={recipe.imageUrl}
                              alt={recipe.title}
                              fill
                              className="object-cover"
                          />
                          </div>
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Link href={`/recettes/${recipe.id}`} className="flex flex-col group/title">
                        <span className="text-lg font-bold group-hover:text-primary group-hover/title:underline decoration-primary transition-all underline-offset-4">{recipe.title}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{recipe.category}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 px-6 hidden md:table-cell">
                      <Badge variant="secondary" className="font-semibold bg-primary/5 text-primary border-primary/10">{recipe.category}</Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6 hidden sm:table-cell font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(recipe.prepTime + recipe.cookTime)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 hidden lg:table-cell font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                         <Users className="h-3.5 w-3.5" />
                         {recipe.servings}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                         <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                          <Link href={`/recettes/${recipe.id}`}>
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                          <Link href={`/recettes/${recipe.id}/modifier`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-2xl font-serif">Supprimer "{recipe.title}" ?</AlertDialogTitle>
                              <AlertDialogDescription className="text-lg">
                                Es-tu sûr de vouloir supprimer cette recette ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-full">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRecipe(recipe.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6"
                              >
                                Supprimer définitivement
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-stagger">
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="relative group animate-in fade-in-0 slide-in-from-bottom-6 fill-mode-both">
                <RecipeCard recipe={recipe} />
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <Button asChild size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur-md shadow-lg h-9 w-9">
                        <Link href={`/recettes/${recipe.id}/modifier`}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="destructive" className="rounded-full shadow-lg h-9 w-9">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-serif font-bold">Supprimer "{recipe.title}" ?</AlertDialogTitle>
                                <AlertDialogDescription className="text-lg">
                                    Une fois effacée, cette recette ne pourra plus être récupérée.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">Conserver</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRecipe(recipe.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6">
                                    Supprimer
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-32 bg-card/50 rounded-[3rem] border-2 border-dashed border-muted-foreground/20">
          <div className="inline-flex items-center justify-center p-8 bg-muted/50 rounded-full mb-6">
             <UtensilsCrossed className="h-16 w-16 text-muted-foreground/30" />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-3">Aucune recette ne correspond</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-lg">
            Essaie d'ajuster tes filtres ou tes termes de recherche pour explorer ta collection.
          </p>
          <Button variant="outline" size="lg" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setMaxTime(240); setMinServings(0); }} className="rounded-full px-10 h-12 border-2">
            Réinitialiser tout
          </Button>
        </div>
      )}
    </div>
  );
}
