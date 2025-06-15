
import { MovieFilterSection } from "../movie/MovieFilterSection";
import { useTranslation } from "react-i18next";

interface GenreFilterProps {
  selectedGenres: string[];
  onGenreChange: (selected: string[]) => void;
}

export const GenreFilter = ({ 
  selectedGenres = [], 
  onGenreChange 
}: GenreFilterProps) => {
  const { t } = useTranslation();

  const MOVIE_GENRES = [
    { id: "action", name: "Action" },
    { id: "adventure", name: "Adventure" },
    { id: "animation", name: "Animation" },
    { id: "comedy", name: "Comedy" },
    { id: "crime", name: "Crime" },
    { id: "documentary", name: "Documentary" },
    { id: "drama", name: "Drama" },
    { id: "family", name: "Family" },
    { id: "fantasy", name: "Fantasy" },
    { id: "history", name: "History" },
    { id: "horror", name: "Horror" },
    { id: "music", name: "Music" },
    { id: "mystery", name: "Mystery" },
    { id: "romance", name: "Romance" },
    { id: "sciFi", name: "Science Fiction" },
    { id: "thriller", name: "Thriller" },
    { id: "war", name: "War" },
    { id: "western", name: "Western" }
  ];

  return (
    <MovieFilterSection
      label="Genre"
      value={selectedGenres.join(',')}
      onValueChange={(value) => onGenreChange(value ? value.split(',') : [])}
      placeholder="Select Genre"
      options={MOVIE_GENRES}
    />
  );
};
