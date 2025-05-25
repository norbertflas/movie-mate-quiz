
import { memo, useMemo } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { MovieCard } from "./MovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { useIsMobile } from "@/hooks/use-mobile";

interface VirtualizedMovieGridProps {
  movies: TMDBMovie[];
  onMovieClick?: (movie: TMDBMovie) => void;
  className?: string;
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 420;
const GAP = 24;

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    movies: TMDBMovie[];
    columnsPerRow: number;
    onMovieClick?: (movie: TMDBMovie) => void;
  };
}

const Cell = memo(({ columnIndex, rowIndex, style, data }: CellProps) => {
  const { movies, columnsPerRow, onMovieClick } = data;
  const movieIndex = rowIndex * columnsPerRow + columnIndex;
  const movie = movies[movieIndex];

  if (!movie) return null;

  return (
    <div style={{ ...style, padding: GAP / 2 }}>
      <MovieCard
        title={movie.title}
        year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
        platform="TMDB"
        genre="Film"
        imageUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg'}
        description={movie.overview}
        trailerUrl=""
        rating={movie.vote_average * 10}
        tmdbId={movie.id}
        onClick={() => onMovieClick?.(movie)}
      />
    </div>
  );
});

Cell.displayName = "MovieGridCell";

export const VirtualizedMovieGrid = memo(({ 
  movies, 
  onMovieClick, 
  className 
}: VirtualizedMovieGridProps) => {
  const isMobile = useIsMobile();
  
  const { columnsPerRow, gridWidth, gridHeight, rowCount } = useMemo(() => {
    const containerWidth = window.innerWidth - 32; // Account for padding
    const columnsPerRow = Math.floor(containerWidth / (CARD_WIDTH + GAP));
    const actualColumnsPerRow = Math.max(1, Math.min(columnsPerRow, isMobile ? 2 : 5));
    
    return {
      columnsPerRow: actualColumnsPerRow,
      gridWidth: actualColumnsPerRow * (CARD_WIDTH + GAP),
      gridHeight: Math.min(600, window.innerHeight - 200), // Max height with some buffer
      rowCount: Math.ceil(movies.length / actualColumnsPerRow)
    };
  }, [movies.length, isMobile]);

  const itemData = useMemo(() => ({
    movies,
    columnsPerRow,
    onMovieClick
  }), [movies, columnsPerRow, onMovieClick]);

  if (movies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No movies found
      </div>
    );
  }

  return (
    <div className={className}>
      <Grid
        columnCount={columnsPerRow}
        columnWidth={CARD_WIDTH + GAP}
        height={gridHeight}
        rowCount={rowCount}
        rowHeight={CARD_HEIGHT + GAP}
        width={gridWidth}
        itemData={itemData}
      >
        {Cell}
      </Grid>
    </div>
  );
});

VirtualizedMovieGrid.displayName = "VirtualizedMovieGrid";
