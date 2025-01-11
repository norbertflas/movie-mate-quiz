import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";

interface MovieCardProps {
  title: string;
  year: string;
  platform: string;
  genre: string;
  imageUrl: string;
  description: string;
  trailerUrl: string;
  rating: number;
  tags?: string[];
}

export const MovieCard = ({
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl,
  rating,
  tags,
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const { toast } = useToast();

  const handleRating = (rating: "like" | "dislike") => {
    setUserRating(rating);
    toast({
      title: "Ocena zapisana",
      description: `Dziękujemy za ocenę filmu "${title}"!`,
    });
  };

  return (
    <Card className="overflow-hidden card-hover">
      <div className="aspect-video relative overflow-hidden">
        {showTrailer ? (
          <iframe
            src={trailerUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        )}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-2 right-2"
          onClick={() => setShowTrailer(!showTrailer)}
        >
          {showTrailer ? "Pokaż zdjęcie" : "Obejrzyj trailer"}
        </Button>
      </div>
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
            className="h-8 w-8"
          >
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < Math.round(rating / 2)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {rating.toFixed(1)}/10
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">{year}</span>
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">
            {platform}
          </span>
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">
            {genre}
          </span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-2">
          <Button
            variant={userRating === "like" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRating("like")}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Podoba mi się
          </Button>
          <Button
            variant={userRating === "dislike" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRating("dislike")}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Nie podoba mi się
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};