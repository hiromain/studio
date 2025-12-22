import Link from 'next/link';
import Image from 'next/image';
import type { Recipe } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              data-ai-hint={recipe.imageHint}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex flex-col justify-between flex-1">
          <div>
            <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>
            <CardTitle className="font-serif text-xl leading-tight mb-2">{recipe.title}</CardTitle>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="mr-2 h-4 w-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
