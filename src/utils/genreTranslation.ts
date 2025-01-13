import { TFunction } from "i18next";

export const getTranslatedGenre = (genre: string, t: TFunction) => {
  const genreKey = genre.toLowerCase().replace(/[\s-]/g, '');
  return t(`movie.${genreKey}`, { defaultValue: genre });
};