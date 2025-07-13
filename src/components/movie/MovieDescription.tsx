import { useTranslation } from "react-i18next";

interface MovieDescriptionProps {
  description: string;
}

export const MovieDescription = ({ description }: MovieDescriptionProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-lg text-gray-200">{t("movie.description")}</h4>
      <p className="text-sm text-gray-400 line-clamp-3 hover:line-clamp-none transition-all duration-300">
        {description}
      </p>
    </div>
  );
};