import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface MovieTagsProps {
  tags: string[];
}

export const MovieTags = ({ tags }: MovieTagsProps) => {
  const { t } = useTranslation();

  if (!tags?.length) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-lg">{t("movie.tags")}</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="outline">
              {t(`movie.${tag.toLowerCase()}`)}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
};