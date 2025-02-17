
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
  const { t, i18n } = useTranslation();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { 
        locale: i18n.language === 'pl' ? pl : undefined 
      });
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
        {/* Left side - Image */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border-2 border-purple-500/20 flex-shrink-0 mx-auto md:mx-0">
          <img
            src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/placeholder.svg'}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Right side - Content */}
        <div className="flex-1">
          {/* Header section */}
          <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            {person.name}
          </h3>
          
          <p className="text-lg font-medium text-muted-foreground mb-4">
            {person.known_for_department && t(`creator.department.${person.known_for_department.toLowerCase()}`)}
          </p>

          {/* General information section */}
          <div className="space-y-3">
            {person.birthday && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(person.birthday)}</span>
                {person.place_of_birth && (
                  <>
                    <span className="text-xs">•</span>
                    <span>{person.place_of_birth}</span>
                  </>
                )}
              </div>
            )}

            {person.biography && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {person.biography}
              </p>
            )}
          </div>

          {/* Known for section */}
          {person.known_for && person.known_for.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                {t("creator.knownFor")}:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {person.known_for.slice(0, 3).map((work: any) => (
                  <li key={work.id}>{work.title || work.name}</li>
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
