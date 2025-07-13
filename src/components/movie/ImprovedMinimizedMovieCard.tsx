
import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MovieCardProps } from "@/types/movie";

interface ImprovedMinimizedMovieCardProps extends MovieCardProps {
  onExpand?: () => void;
}

export const ImprovedMinimizedMovieCard = memo(({
  title = "Unknown Movie",
  year = "N/A",
  platform = "Unknown",
  genre = "",
  imageUrl = '/placeholder.svg',
  description = "",
  rating = 0,
  onExpand,
  onClick,
  ...props
}: ImprovedMinimizedMovieCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onExpand) {
      onExpand();
    }
  };

  const displayRating = typeof rating === 'number' ? Math.round(rating) : 0;

  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-gray-700 bg-gray-800/50 backdrop-blur-sm"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={imageError ? '/placeholder.svg' : imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Rating badge */}
        {displayRating > 0 && (
          <Badge className="absolute top-2 left-2 bg-black/70 text-white backdrop-blur-sm border-yellow-500/50">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {displayRating}%
          </Badge>
        )}

        {/* Hover overlay with buttons */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <Info className="w-4 h-4 mr-1" />
                Details
              </Button>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-3 text-white">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{year}</span>
          <span className="text-xs px-2 py-1 bg-gray-700/50 rounded text-gray-300">
            {platform}
          </span>
        </div>

        {genre && (
          <div className="text-xs text-gray-500 line-clamp-1">
            {genre}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ImprovedMinimizedMovieCard.displayName = "ImprovedMinimizedMovieCard";
