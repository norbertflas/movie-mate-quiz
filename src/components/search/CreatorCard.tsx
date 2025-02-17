
import { motion } from "framer-motion";
import type { TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";

interface CreatorCardProps {
  person: TMDBPerson;
  index: number;
  onClick: () => void;
}

export const CreatorCard = ({ person, index, onClick }: CreatorCardProps) => {
  const { t } = useTranslation();
  
  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-card to-card/95 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-purple-500/10 hover:border-purple-500/20 hover:-translate-y-1"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center gap-6"
      >
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/20">
          <img
            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/placeholder.svg'}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{person.name}</h3>
          <p className="text-muted-foreground mb-4">
            {person.known_for_department && t(`creator.department.${person.known_for_department}`)}
          </p>
          {person.known_for && person.known_for.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("creator.bestWorks")}:
              </p>
              <ul className="text-sm text-muted-foreground">
                {person.known_for.slice(0, 3).map((work: any) => (
                  <li key={work.id} className="mb-1">
                    {work.title || work.name}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-purple-500 mt-2 hover:text-purple-600 transition-colors">
                {t("creator.clickToSeeWorks")}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
