
import { useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Search as SearchIcon, Star, ChevronRight, Film, User, Clapperboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies, searchPeople, type TMDBMovie, type TMDBPerson } from "@/services/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { MouseGlow } from "@/components/effects/MouseGlow";
import { Footer } from "@/components/Footer";
import { MovieModal, useMovieModal } from "@/components/movie/MovieModal";

const Search = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"Movies" | "Cast" | "Directors">("Movies");
  const [selectedStreaming, setSelectedStreaming] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Popularity");
  const [yearRange, setYearRange] = useState(2025);
  const [ratingRange, setRatingRange] = useState(0);
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  const { data: movies = [], isLoading: isLoadingMovies } = useQuery({
    queryKey: ["searchMovies", query],
    queryFn: () => searchMovies(query),
    enabled: query.length > 1 && searchType === "Movies",
  });

  const { data: people = [], isLoading: isLoadingPeople } = useQuery({
    queryKey: ["searchPeople", query],
    queryFn: () => searchPeople(query),
    enabled: query.length > 1 && (searchType === "Cast" || searchType === "Directors"),
  });

  const streamingServices = ["Netflix", "Prime Video", "HBO Max", "Disney+", "Apple TV+"];
  const genres = ["Action", "Comedy", "Drama", "Sci-Fi", "Thriller", "Horror", "Fantasy", "Adventure"];

  const filteredMovies = useMemo(() => {
    let filtered = [...movies];
    filtered = filtered.filter((movie) => {
      const movieYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
      const matchesYear = movieYear <= yearRange;
      const matchesRating = (movie.vote_average || 0) >= ratingRange;
      return matchesYear && matchesRating;
    });
    if (sortBy === "Rating") filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    if (sortBy === "Newest") filtered.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    return filtered;
  }, [movies, yearRange, ratingRange, sortBy]);

  const toggleStreaming = (service: string) => {
    setSelectedStreaming((prev) => prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]);
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#02020a] selection:bg-purple-500/30">
      <MouseGlow />
      <div className="relative z-10">
        <Navigation />

        <div className="pt-40 pb-24 px-4 sm:px-12 max-w-7xl mx-auto w-full min-h-screen">
          {/* Search Bar - Command-K Style */}
          <div className="relative mb-16">
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <SearchIcon className={`w-7 h-7 transition-all ${isLoadingMovies || isLoadingPeople ? "text-purple-500 animate-pulse" : "text-white/30"}`} />
            </div>
            <input
              type="text"
              placeholder="Search for movies, TV shows, actors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-7 pl-20 pr-10 text-xl text-white focus:outline-none focus:border-purple-500/50 transition-all shadow-2xl backdrop-blur-3xl placeholder:text-white/20 font-display"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-4 mb-10">
            {(["Movies", "Cast", "Directors"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  searchType === type
                    ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {type === "Movies" && <Film className="w-4 h-4 inline mr-2" />}
                {type === "Cast" && <User className="w-4 h-4 inline mr-2" />}
                {type === "Directors" && <Clapperboard className="w-4 h-4 inline mr-2" />}
                {type}
              </button>
            ))}
          </div>

          {/* Filters Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {/* Streaming Services */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                Streaming Services
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {streamingServices.map((service) => (
                  <button
                    key={service}
                    onClick={() => toggleStreaming(service)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                      selectedStreaming.includes(service)
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Release Year */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                Release Year (Up to)
              </h3>
              <div className="space-y-6">
                <input
                  type="range"
                  min="1980"
                  max="2025"
                  value={yearRange}
                  onChange={(e) => setYearRange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs font-bold text-white/30">
                  <span>1980</span>
                  <span className="text-purple-400">{yearRange}</span>
                </div>
              </div>
            </div>

            {/* Genre */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                Genre
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                      selectedGenres.includes(genre)
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* IMDb Rating */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                Min Rating
              </h3>
              <div className="space-y-6">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={ratingRange}
                  onChange={(e) => setRatingRange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs font-bold text-white/30">
                  <span>0.0</span>
                  <span className="text-purple-400">{ratingRange.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Sort By */}
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6">
                Sort By
              </h3>
              <div className="flex flex-col gap-3">
                {["Popularity", "Rating", "Newest"].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border ${
                      sortBy === sort
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                    }`}
                  >
                    {sort}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {searchType === "Movies" && filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
              {filteredMovies.map((movie, idx) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                  onClick={() => openModal(movie)}
                  className="group relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer shadow-2xl"
                >
                  {/* Top Match badge for first result */}
                  {idx === 0 && query.length > 1 && (
                    <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[9px] font-black uppercase tracking-widest">
                      Top Match
                    </div>
                  )}

                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "/placeholder.svg"
                      }
                      alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-hover:brightness-125 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                      <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-yellow-400" />
                            <span className="text-xs font-black">{movie.vote_average?.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-white/60 font-bold">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                          </span>
                        </div>
                        <button className="w-full py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all shadow-xl active:scale-95">
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-xl border border-white/20 text-yellow-400 text-[10px] font-black flex items-center gap-1.5 shadow-2xl group-hover:opacity-0 transition-opacity">
                      <Star className="w-3 h-3 fill-yellow-400" /> {movie.vote_average?.toFixed(1)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-sm font-bold text-white mb-2 truncate leading-tight">
                      {movie.title} ({movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"})
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : searchType !== "Movies" && people.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {people.map((person, idx) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group text-center"
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-purple-500 transition-all">
                    <img
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w300${person.profile_path}` : "/placeholder.svg"}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-white">{person.name}</h3>
                  <p className="text-xs text-white/30">{person.known_for_department}</p>
                </motion.div>
              ))}
            </div>
          ) : query.length > 1 && !isLoadingMovies && !isLoadingPeople ? (
            <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl">
              <SearchIcon className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white mb-2 font-display">No results found</h3>
              <p className="text-white/30 font-bold">Try adjusting your filters or search query.</p>
            </div>
          ) : query.length <= 1 ? (
            <div className="text-center py-32">
              <SearchIcon className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-white mb-2 font-display">The Archive Awaits</h3>
              <p className="text-white/30 font-bold">Start typing to explore our cinematic database.</p>
            </div>
          ) : null}
        </div>

        <Footer />
      </div>

      <MovieModal movie={selectedMovie} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Search;
