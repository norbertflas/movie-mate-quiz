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
  explanations,
  streamingServices,
  isExpanded,
  showTrailer,
  onWatchTrailer,
  userRating,
  onRate
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
        tmdbId={tmdbId}
        explanations={explanations}
        streamingServices={streamingServices}
        isExpanded={isExpanded}
        showTrailer={showTrailer}
        onWatchTrailer={onWatchTrailer}
        userRating={userRating}
        onRate={onRate}
      />
    </Card>
  );
});

MovieCardBase.displayName = "MovieCardBase";

export { MovieCardBase };