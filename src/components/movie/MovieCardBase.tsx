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
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          width={300}
          height={450}
        />
      </div>
      <MovieCardContent
        title={title}
        year={year}
        platform={platform}
        genre={genre}
        description={description}
        rating={rating}
        tmdbId={tmdbId}
        explanations={explanations}
      />
    </Card>
  );
});

MovieCardBase.displayName = "MovieCardBase";

export { MovieCardBase };