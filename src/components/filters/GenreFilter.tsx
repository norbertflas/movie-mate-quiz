import { MovieFilterSection } from "../movie/MovieFilterSection";
import { useTranslation } from "react-i18next";

interface GenreFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

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

export const GenreFilter = ({ value, onChange }: GenreFilterProps) => {
  const { t } = useTranslation();

  return (
    <MovieFilterSection
      label={t("filters.genre")}
      value={value}
      onValueChange={onChange}
      placeholder={t("filters.selectGenre")}
      options={MOVIE_GENRES.map(genre => ({
        id: genre.id,
        name: t(`movie.${genre.id.toLowerCase()}`),
      }))}
    />
  );
};