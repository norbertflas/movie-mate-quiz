
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

interface MovieMetadataProps {
  year: string;
  genre: string;
  rating: number;
}

export const MovieMetadata = ({ year, genre, rating }: MovieMetadataProps) => {
  return (
    <Card className="p-4 bg-background/50 backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Release Year</p>
          <p className="font-medium">{year}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Genre</p>
          <p className="font-medium">{genre}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Rating</p>
          <p className="font-medium">{rating}%</p>
        </div>
      </div>
    </Card>
  );
};
