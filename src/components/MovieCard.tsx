import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, ChevronDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { MovieRating } from "./movie/MovieRating";
import { MovieTrailer } from "./movie/MovieTrailer";
import { MovieActions } from "./movie/MovieActions";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";

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
  streamingServices?: string[];
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
  streamingServices = [],
}: MovieCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState<"like" | "dislike" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const { toast } = useToast();
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      const region = languageToRegion[i18n.language] || 'en';
      const services = await getStreamingServicesByRegion(region);
      setAvailableServices(services);
    };

    fetchStreamingServices();
  }, [i18n.language]);

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
        {showTrailer && trailerUrl ? (
          <MovieTrailer trailerUrl={trailerUrl} title={title} />
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
            <MovieRating rating={rating} />
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

        {availableServices.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold">Dostępne na:</span>
            {availableServices.map((service) => (
              <Badge key={service.id} variant="secondary">
                {service.name}
              </Badge>
            ))}
          </div>
        )}

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
            {trailerUrl && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setShowTrailer(!showTrailer)}
              >
                {showTrailer ? "Pokaż zdjęcie" : "Obejrzyj trailer"}
              </Button>
            )}
            <MovieActions userRating={userRating} onRate={handleRating} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};