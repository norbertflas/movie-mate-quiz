import { memo } from "react";
import { Card } from "@/components/ui/card";
import { MovieImage } from "./MovieImage";
import { MovieCardContent } from "./MovieCardContent";
import type { MovieCardProps } from "@/types/movie";

const MovieCardBase = memo(({ 
  title,
  year,
  platform,
  genre,
  imageUrl,
  description,
  trailerUrl,
  rating,
  tmdbId,
  explanations
}: MovieCardProps) => {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="aspect-[2/3] overflow-hidden">
        <MovieImage
          imageUrl={imageUrl}
          title={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          width={300}
          height={450}
        />
      </div>
      <MovieCardContent
        title={title}
        year={year}
        description={description}
        rating={rating}
        genre={genre}
        tmdbId={tmdbId || 0}
        explanations={explanations}
      />
    </Card>
  );
});

MovieCardBase.displayName = "MovieCardBase";

export { MovieCardBase };