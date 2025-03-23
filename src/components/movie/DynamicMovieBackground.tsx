
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getPopularMovies } from "@/services/tmdb/trending";
import { useQuery } from "@tanstack/react-query";

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

  // Fetch trending movies from TMDB
  const { data: trendingMovies = [] } = useQuery({
    queryKey: ['backgroundMovies'],
    queryFn: async () => {
      const movies = await getPopularMovies(1); // Pass page number parameter
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg",
        posterImage: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.svg",
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 2024,
        rating: movie.vote_average || 5.0,
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Create rows of movies for the scrolling background
  useEffect(() => {
    const createRows = () => {
      if (trendingMovies.length === 0) return;
      
      // Shuffle the movies array to randomize the order
      const shuffled = [...trendingMovies].sort(() => 0.5 - Math.random());

      // Create rows with different movies
      const newRows = [];
      const moviesPerRow = 8; // We'll duplicate these to create an infinite scroll effect

      for (let i = 0; i < rowCount; i++) {
        // Get a slice of movies for this row, with wrapping if we run out
        const startIndex = (i * moviesPerRow) % shuffled.length;
        let rowMovies = shuffled.slice(startIndex, startIndex + moviesPerRow);

        // If we don't have enough movies, wrap around to the beginning
        if (rowMovies.length < moviesPerRow) {
          rowMovies = [...rowMovies, ...shuffled.slice(0, moviesPerRow - rowMovies.length)];
        }

        // Duplicate the movies to create a seamless loop
        newRows.push([...rowMovies, ...rowMovies]);
      }

      setRows(newRows);
    };

    createRows();

    // Refresh the rows every 2 hours to simulate updating trending movies
    const interval = setInterval(createRows, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [trendingMovies, rowCount]);

  // Calculate poster dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Adjust poster size based on screen width
        if (containerWidth < 640) {
          // Mobile
          setPosterDimensions({ width: 100, height: 150 });
        } else if (containerWidth < 1024) {
          // Tablet
          setPosterDimensions({ width: 120, height: 180 });
        } else {
          // Desktop
          setPosterDimensions({ width: 140, height: 210 });
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate animation duration based on speed prop
  const getAnimationDuration = (rowIndex: number) => {
    const baseDuration = speed === "slow" ? 180 : speed === "fast" ? 80 : 120;
    return baseDuration + rowIndex * 15;
  };

  // Get background styles based on variant
  const getBackgroundStyles = () => {
    switch (variant) {
      case "light":
        return {
          backgroundColor: "#f8fafc",
          backgroundImage:
            "radial-gradient(circle at center, rgba(224, 231, 255, 0.6) 0%, rgba(248, 250, 252, 0.8) 100%)",
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

  // Get overlay styles based on variant
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

  // Get gradient overlay styles based on variant
  const getGradientOverlayStyles = () => {
    switch (variant) {
      case "light":
        return "from-blue-100/30 to-purple-100/30";
      case "dark":
        return "from-blue-950/30 to-purple-950/30";
      case "gradient":
        return "from-blue-800/30 to-purple-800/30";
      default:
        return "from-blue-900/30 to-purple-900/30";
    }
  };

  // Get poster opacity based on variant
  const getPosterOpacity = () => {
    return variant === "light" ? 0.5 : 0.7;
  };

  return (
    <div ref={containerRef} className={`relative w-full overflow-hidden ${className}`} style={getBackgroundStyles()}>
      {/* Scrolling movie posters background */}
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
              marginBottom: 16, // Gap between rows
              marginTop: rowIndex === 0 ? -20 : 0, // Offset first row
              opacity: getPosterOpacity(),
              filter: "brightness(0.7)",
            }}
          >
            {row.map((movie, movieIndex) => (
              <motion.div
                key={`${movie.id}-${movieIndex}`}
                className="relative flex-shrink-0 mx-2 rounded-md overflow-hidden shadow-lg"
                style={{
                  width: posterDimensions.width,
                  height: posterDimensions.height,
                  transform: `rotate(${Math.random() * 6 - 3}deg) translateY(${Math.random() * 10 - 5}px)`,
                  transformOrigin: "center center",
                  zIndex: Math.floor(Math.random() * 10),
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: 0,
                  filter: "brightness(1.2)",
                  zIndex: 20,
                  transition: { duration: 0.3 },
                }}
              >
                <img
                  src={movie.posterImage}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

                {/* Subtle blue/purple glow effect on hover */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md" />
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Dark overlay with appropriate gradient */}
      <div
        className={`absolute inset-0 z-10 bg-gradient-to-b ${getOverlayStyles()}`}
        style={{ opacity: overlayOpacity }}
      />

      {/* Additional blue/purple gradient overlay */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-r ${getGradientOverlayStyles()} mix-blend-overlay`} />

      {/* Content container */}
      <div className="relative z-20">{children}</div>
    </div>
  );
};
