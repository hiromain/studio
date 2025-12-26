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
import { Pencil, Trash2, Plus, UtensilsCrossed, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';

export default function RecipesManagementPage() {
  const { recipes, deleteRecipe, isLoading } = useRecipes();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Button onClick={() => router.push('/')} variant="ghost" className="mb-2 -ml-2 hover:bg-primary/10 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au site
          </Button>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Gestion des Recettes</h1>
          <p className="text-muted-foreground mt-1">Ajoute, modifie ou supprime tes pépites culinaires.</p>
        </div>
        <Button asChild className="rounded-full px-6 shadow-lg hover:shadow-xl transition-all">
          <Link href="/recettes/nouvelle">
            <Plus className="mr-2 h-5 w-5" /> Nouvelle Recette
          </Link>
        </Button>
      </div>

      {recipes.length > 0 ? (
        <div className="bg-card rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[100px] py-4 px-6">Image</TableHead>
                <TableHead className="py-4 px-6">Titre</TableHead>
                <TableHead className="py-4 px-6 hidden md:table-cell">Catégorie</TableHead>
                <TableHead className="py-4 px-6 hidden sm:table-cell">Temps</TableHead>
                <TableHead className="text-right py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id} className="group hover:bg-muted/30 transition-colors border-border/50">
                  <TableCell className="py-4 px-6">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-lg group-hover:text-primary transition-colors">{recipe.title}</span>
                      <span className="text-xs text-muted-foreground md:hidden">{recipe.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 hidden md:table-cell">
                    <Badge variant="secondary" className="font-semibold">{recipe.category}</Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 hidden sm:table-cell font-medium text-muted-foreground">
                    {formatDuration(recipe.prepTime + recipe.cookTime)}
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="flex justify-end gap-2">
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
        <div className="text-center py-24 bg-card/50 rounded-3xl border border-dashed border-muted-foreground/30">
          <div className="inline-flex items-center justify-center p-6 bg-muted rounded-full mb-6">
             <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pas de recettes à gérer !</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Commence par ajouter quelques pépites culinaires pour les voir s&apos;afficher ici.
          </p>
          <Button asChild className="rounded-full px-8">
            <Link href="/recettes/nouvelle">Ajouter ma première recette</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
