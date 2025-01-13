import { MovieFilterSection } from "../movie/MovieFilterSection";
import { useTranslation } from "react-i18next";
import { MOVIE_CATEGORIES } from "../quiz/QuizConstants";

interface GenreFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export const GenreFilter = ({ value, onChange }: GenreFilterProps) => {
  const { t } = useTranslation();

  return (
    <MovieFilterSection
      label={t("filters.genre")}
      value={value}
      onValueChange={onChange}
      placeholder={t("filters.selectGenre")}
      options={MOVIE_CATEGORIES.map(category => ({
        id: category,
        name: t(`movie.${category.toLowerCase()}`),
      }))}
    />
  );
};