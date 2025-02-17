
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
      className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200"
    >
      <div className="flex flex-col items-center space-y-4">
        {person.profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
            alt={person.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-400">{person.name[0]}</span>
          </div>
        )}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">{person.name}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {person.known_for_department}
          </p>
        </div>
      </div>

      {person.known_for && person.known_for.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 text-center text-muted-foreground">
            {t("search.knownFor")}
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {person.known_for
              .slice(0, 3)
              .sort((a, b) => ((b.popularity || 0) - (a.popularity || 0)))
              .map((work) => (
                <span
                  key={work.id}
                  className="text-xs bg-accent/50 px-3 py-1.5 rounded-full"
                >
                  {work.title || work.name}
                </span>
              ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-center text-sm text-muted-foreground">
          <p className="hover:text-primary transition-colors duration-200">
            {t("search.clickCreatorInfo")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
