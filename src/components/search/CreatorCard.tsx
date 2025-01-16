import { motion } from "framer-motion";
import type { TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";

interface CreatorCardProps {
  person: TMDBPerson;
  index: number;
}

export const CreatorCard = ({ person, index }: CreatorCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-lg p-4 shadow-lg"
    >
      <div className="flex items-center gap-4">
        {person.profile_path && (
          <img
            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
            alt={person.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold">{person.name}</h3>
          <p className="text-sm text-muted-foreground">
            {person.known_for_department}
          </p>
        </div>
      </div>
      {person.known_for && person.known_for.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">{t("search.knownFor")}</h4>
          <div className="flex flex-wrap gap-2">
            {person.known_for.map((work: any) => (
              <span
                key={work.id}
                className="text-xs bg-accent/50 px-2 py-1 rounded-full"
              >
                {work.title || work.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};