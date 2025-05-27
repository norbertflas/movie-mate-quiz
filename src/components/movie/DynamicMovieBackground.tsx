
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getPopularMovies } from "@/services/tmdb/trending";
import { useQuery } from "@tanstack/react-query";
import { useScrollContext } from "@/hooks/use-scroll-context";

interface Movie {
  id: number;
  title: string;
  image: string;
  posterImage: string;
  year: number;
  rating: number;
}

interface DynamicMovieBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  overlayOpacity?: number;
  variant?: "default" | "light" | "dark" | "gradient";
  rowCount?: number;
  speed?: "slow" | "medium" | "fast";
}

export const DynamicMovieBackground = ({
  className = "",
  children,
  overlayOpacity = 0.8,
  variant = "default",
  rowCount = 6,
  speed = "medium",
}: DynamicMovieBackgroundProps) => {
  const [rows, setRows] = useState<Movie[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [posterDimensions, setPosterDimensions] = useState({ width: 140, height: 210 });
  const { isScrolling } = useScrollContext();

  // Fetch trending movies from TMDB
  const { data: trendingMovies = [] } = useQuery({
    queryKey: ['backgroundMovies'],
    queryFn: async () => {
      const movies = await getPopularMovies({ queryKey: ['popularMovies', '', '1'] });
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg",
        posterImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg",
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 2024,
        rating: movie.vote_average || 5.0,
      }));
    },
    staleTime: 1000 * 60 * 60,
  });

  // Create rows of movies - simplified
  useEffect(() => {
    if (trendingMovies.length === 0) return;
    
    const shuffled = [...trendingMovies].sort(() => 0.5 - Math.random());
    const newRows = [];
    const moviesPerRow = 8;

    for (let i = 0; i < rowCount; i++) {
      const startIndex = (i * moviesPerRow) % shuffled.length;
      let rowMovies = shuffled.slice(startIndex, startIndex + moviesPerRow);

      if (rowMovies.length < moviesPerRow) {
        rowMovies = [...rowMovies, ...shuffled.slice(0, moviesPerRow - rowMovies.length)];
      }

      newRows.push([...rowMovies, ...rowMovies]);
    }

    setRows(newRows);
  }, [trendingMovies, rowCount]);

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth < 480) {
          setPosterDimensions({ width: 90, height: 135 });
        } else if (containerWidth < 640) {
          setPosterDimensions({ width: 100, height: 150 });
        } else if (containerWidth < 768) {
          setPosterDimensions({ width: 110, height: 165 });
        } else if (containerWidth < 1024) {
          setPosterDimensions({ width: 120, height: 180 });
        } else if (containerWidth < 1280) {
          setPosterDimensions({ width: 130, height: 195 });
        } else {
          setPosterDimensions({ width: 140, height: 210 });
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getAnimationDuration = (rowIndex: number) => {
    const baseDuration = speed === "slow" ? 180 : speed === "fast" ? 80 : 120;
    return baseDuration + rowIndex * 15;
  };

  const getBackgroundStyles = () => {
    switch (variant) {
      case "light":
        return {
          backgroundColor: "#f8fafc",
          backgroundImage: "radial-gradient(circle at center, rgba(224, 231, 255, 0.6) 0%, rgba(248, 250, 252, 0.8) 100%)",
        };
      case "dark":
        return {
          backgroundColor: "#020617",
          backgroundImage: "radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.8) 100%)",
        };
      case "gradient":
        return {
          backgroundColor: "#0f172a",
          backgroundImage: "linear-gradient(to bottom right, rgba(30, 58, 138, 0.4), rgba(109, 40, 217, 0.4))",
        };
      default:
        return {
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, rgba(10, 10, 20, 0.8) 100%)",
        };
    }
  };

  const getOverlayStyles = () => {
    switch (variant) {
      case "light":
        return "from-white/90 via-white/80 to-white/90";
      case "dark":
        return "from-gray-950/90 via-gray-950/80 to-gray-950/90";
      case "gradient":
        return "from-blue-950/90 via-indigo-950/80 to-purple-950/90";
      default:
        return "from-black/90 via-black/80 to-black/90";
    }
  };

  const getPosterOpacity = () => {
    return variant === "light" ? 0.5 : 0.7;
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full overflow-hidden ${className}`} 
      style={getBackgroundStyles()}
    >
      {/* Scrolling movie posters background - optimized */}
      <div className="absolute inset-0 z-0">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={`row-${rowIndex}`}
            className="flex"
            initial={{
              x: rowIndex % 2 === 0 ? 0 : (-posterDimensions.width * row.length) / 2,
            }}
            animate={{
              x: rowIndex % 2 === 0 ? (-posterDimensions.width * row.length) / 2 : 0,
            }}
            transition={{
              duration: getAnimationDuration(rowIndex),
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
            }}
            style={{
              height: posterDimensions.height,
              marginBottom: 16,
              marginTop: rowIndex === 0 ? -20 : 0,
              opacity: getPosterOpacity(),
              filter: "brightness(0.7)",
              willChange: "transform", // Performance optimization
            }}
          >
            {row.map((movie, movieIndex) => (
              <div
                key={`${movie.id}-${movieIndex}`}
                className="relative flex-shrink-0 mx-2 rounded-md overflow-hidden shadow-lg"
                style={{
                  width: posterDimensions.width,
                  height: posterDimensions.height,
                  transform: `rotate(${Math.random() * 6 - 3}deg) translateY(${Math.random() * 10 - 5}px)`,
                  transformOrigin: "center center",
                  zIndex: Math.floor(Math.random() * 10),
                  pointerEvents: isScrolling ? 'none' : 'auto', // Disable interactions during scroll
                }}
              >
                <img
                  src={movie.posterImage}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Overlay layers */}
      <div
        className={`absolute inset-0 z-10 bg-gradient-to-b ${getOverlayStyles()}`}
        style={{ opacity: overlayOpacity }}
      />

      <div className="relative z-20">{children}</div>
    </div>
  );
};
