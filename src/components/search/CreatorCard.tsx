
import { motion } from "framer-motion";
import type { TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface CreatorCardProps {
  person: TMDBPerson;
  index: number;
  onClick: () => void;
}

export const CreatorCard = ({ person, index, onClick }: CreatorCardProps) => {
  const { t } = useTranslation();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: pl });
    } catch {
      return "";
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-card to-card/95 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-purple-500/10 hover:border-purple-500/20 hover:-translate-y-1"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-col md:flex-row gap-6"
      >
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-purple-500/20 flex-shrink-0 mx-auto md:mx-0">
          <img
            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/placeholder.svg'}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            {person.name}
          </h3>
          
          <p className="text-lg font-medium text-muted-foreground mb-3">
            {person.known_for_department && t(`creator.department.${person.known_for_department}`)}
          </p>

          {person.birthday && (
            <p className="text-sm text-muted-foreground mb-2">
              {t("creator.birthDate")}: {formatDate(person.birthday)}
              {person.place_of_birth && ` • ${person.place_of_birth}`}
            </p>
          )}

          {person.biography && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {person.biography}
            </p>
          )}

          {person.known_for && person.known_for.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {t("creator.knownFor")}:
              </p>
              <ul className="text-sm text-muted-foreground">
                {person.known_for.slice(0, 3).map((work: any) => (
                  <li key={work.id} className="mb-1">
                    {work.title || work.name}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-purple-500 mt-3 hover:text-purple-600 transition-colors">
                {t("creator.clickToSeeWorks")}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
