import type { Recipe } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

export const MOCK_RECIPES: Recipe[] = [
 
];
