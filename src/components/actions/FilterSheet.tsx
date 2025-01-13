import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { MOVIE_CATEGORIES } from "../quiz/QuizConstants";

interface FilterSheetProps {
  selectedGenre: string | undefined;
  setSelectedGenre: (genre: string) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const FilterSheet = ({
  selectedGenre,
  setSelectedGenre,
  minRating,
  setMinRating,
  isOpen,
  setIsOpen,
}: FilterSheetProps) => {
  const handleRatingChange = (values: number[]) => {
    if (values.length > 0) {
      setMinRating(values[0]);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10 hover:from-blue-600/20 hover:via-violet-600/20 hover:to-purple-600/20 border-blue-600/20"
        >
          <Filter className="mr-2 h-4 w-4" />
          <span className="text-sm">Opcje filtrowania</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Ustawienia filtrów</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Gatunek</Label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz gatunek" />
              </SelectTrigger>
              <SelectContent>
                {MOVIE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "28" ? "Akcja" :
                     category === "12" ? "Przygodowy" :
                     category === "16" ? "Animacja" :
                     category === "35" ? "Komedia" :
                     category === "80" ? "Kryminał" :
                     category === "99" ? "Dokumentalny" :
                     category === "18" ? "Dramat" :
                     category === "10751" ? "Familijny" :
                     category === "14" ? "Fantasy" :
                     category === "36" ? "Historyczny" :
                     category === "27" ? "Horror" :
                     category === "10402" ? "Muzyczny" :
                     category === "9648" ? "Tajemnica" :
                     category === "10749" ? "Romans" :
                     category === "878" ? "Science Fiction" :
                     category === "10770" ? "Film TV" :
                     category === "53" ? "Thriller" :
                     category === "10752" ? "Wojenny" :
                     category === "37" ? "Western" :
                     category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Minimalna ocena</Label>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[minRating]}
              onValueChange={handleRatingChange}
              className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600"
            />
            <div className="text-sm text-muted-foreground">
              {minRating}/100
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};