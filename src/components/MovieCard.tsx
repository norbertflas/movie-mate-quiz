import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Star, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

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
  const [isExpanded, setIsExpanded] = useState(false);
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
      </div>
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl line-clamp-1">{title}</CardTitle>
            <div className="flex items-center space-x-1 mt-1">
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
          </div>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">{year}</span>
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">
            {platform}
          </span>
          <span className="text-sm px-2 py-1 bg-secondary rounded-md">
            {genre}
          </span>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-2"
            >
              <span>Szczegóły</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{description}</p>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowTrailer(!showTrailer)}
            >
              {showTrailer ? "Pokaż zdjęcie" : "Obejrzyj trailer"}
            </Button>
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
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};