
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useScrollContext } from "@/hooks/use-scroll-context";

interface Movie {
  id: number;
  title: string;
  image: string;
  posterImage: string;
  year: number;
  rating: number;
}

interface WelcomeMovieBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  overlayOpacity?: number;
  variant?: "default" | "light" | "dark" | "gradient";
  rowCount?: number;
  speed?: "slow" | "medium" | "fast";
}

// Different movies for welcome section
const welcomeMovies: Movie[] = [
  { id: 27205, title: "Inception", image: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", posterImage: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", year: 2010, rating: 8.8 },
  { id: 603, title: "The Matrix", image: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", posterImage: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", year: 1999, rating: 8.7 },
  { id: 157336, title: "Interstellar", image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", posterImage: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", year: 2014, rating: 8.6 },
  { id: 278, title: "The Shawshank Redemption", image: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", posterImage: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", year: 1994, rating: 9.3 },
  { id: 372058, title: "Your Name", image: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg", posterImage: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg", year: 2016, rating: 8.4 },
  { id: 244786, title: "Whiplash", image: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg", posterImage: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg", year: 2014, rating: 8.5 },
  { id: 335984, title: "Blade Runner 2049", image: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", posterImage: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg", year: 2017, rating: 8.0 },
  { id: 299536, title: "Avengers: Infinity War", image: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", posterImage: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", year: 2018, rating: 8.4 },
  { id: 299534, title: "Avengers: Endgame", image: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", posterImage: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", year: 2019, rating: 8.4 },
  { id: 324857, title: "Spider-Man: Into the Spider-Verse", image: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", posterImage: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg", year: 2018, rating: 8.4 },
  { id: 914, title: "The Great Dictator", image: "https://image.tmdb.org/t/p/w500/1QpO9wo7JWecZ4NiBuu625FiY1j.jpg", posterImage: "https://image.tmdb.org/t/p/w500/1QpO9wo7JWecZ4NiBuu625FiY1j.jpg", year: 1940, rating: 8.4 },
  { id: 533535, title: "Deadpool & Wolverine", image: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", posterImage: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg", year: 2024, rating: 7.7 },
  { id: 16869, title: "Inglourious Basterds", image: "https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg", posterImage: "https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg", year: 2009, rating: 8.2 },
  { id: 807, title: "Se7en", image: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg", posterImage: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg", year: 1995, rating: 8.6 },
  { id: 1891, title: "The Empire Strikes Back", image: "https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg", posterImage: "https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg", year: 1980, rating: 8.7 },
  { id: 11, title: "Star Wars", image: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", posterImage: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", year: 1977, rating: 8.6 }
];

export const WelcomeMovieBackground = ({
  className = "",
  children,
  overlayOpacity = 0.8,
  variant = "default",
  rowCount = 6,
  speed = "medium",
}: WelcomeMovieBackgroundProps) => {
  const [rows, setRows] = useState<Movie[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [posterDimensions, setPosterDimensions] = useState({ width: 140, height: 210 });
  const { isScrolling } = useScrollContext();

  // Create rows of movies using welcome movies
  useEffect(() => {
    const shuffled = [...welcomeMovies].sort(() => 0.5 - Math.random());
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
