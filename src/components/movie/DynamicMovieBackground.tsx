
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

// Bestseller movies - static list to avoid API calls
const bestsellerMovies: Movie[] = [
  { id: 550, title: "Fight Club", image: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", posterImage: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", year: 1999, rating: 8.8 },
  { id: 238, title: "The Godfather", image: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", posterImage: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", year: 1972, rating: 9.2 },
  { id: 240, title: "The Godfather: Part II", image: "https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg", posterImage: "https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg", year: 1974, rating: 9.0 },
  { id: 424, title: "Schindler's List", image: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", posterImage: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", year: 1993, rating: 8.9 },
  { id: 389, title: "12 Angry Men", image: "https://image.tmdb.org/t/p/w500/ppd84D2i9W8jXmsyInGyihiSyqF.jpg", posterImage: "https://image.tmdb.org/t/p/w500/ppd84D2i9W8jXmsyInGyihiSyqF.jpg", year: 1957, rating: 8.9 },
  { id: 129, title: "Spirited Away", image: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", posterImage: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", year: 2001, rating: 8.6 },
  { id: 19404, title: "Dilwale Dulhania Le Jayenge", image: "https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg", posterImage: "https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg", year: 1995, rating: 8.7 },
  { id: 155, title: "The Dark Knight", image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", posterImage: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", year: 2008, rating: 9.0 },
  { id: 496243, title: "Parasite", image: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", posterImage: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", year: 2019, rating: 8.5 },
  { id: 497, title: "The Green Mile", image: "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg", posterImage: "https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg", year: 1999, rating: 8.6 },
  { id: 13, title: "Forrest Gump", image: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", posterImage: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", year: 1994, rating: 8.8 },
  { id: 680, title: "Pulp Fiction", image: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", posterImage: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", year: 1994, rating: 8.9 },
  { id: 122, title: "The Lord of the Rings: The Return of the King", image: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", posterImage: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", year: 2003, rating: 8.9 },
  { id: 429, title: "The Good, the Bad and the Ugly", image: "https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg", posterImage: "https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg", year: 1966, rating: 8.8 },
  { id: 769, title: "GoodFellas", image: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", posterImage: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", year: 1990, rating: 8.7 },
  { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", image: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", posterImage: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", year: 2001, rating: 8.8 }
];

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

  // Create rows of movies using bestsellers
  useEffect(() => {
    const shuffled = [...bestsellerMovies].sort(() => 0.5 - Math.random());
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
  }, [rowCount]);

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
              willChange: "transform",
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
                  pointerEvents: isScrolling ? 'none' : 'auto',
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
