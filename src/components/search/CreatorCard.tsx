
import { motion } from "framer-motion";
import type { TMDBPerson } from "@/services/tmdb";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { tmdbFetch } from "@/services/tmdb/utils";

interface CreatorCardProps {
  person: TMDBPerson;
  index: number;
  onClick: () => void;
}

export const CreatorCard = ({ person, index, onClick }: CreatorCardProps) => {
  const { t } = useTranslation();

  const { data: creatorDetails } = useQuery({
    queryKey: ['creatorDetails', person.id],
    queryFn: async () => {
      const response = await tmdbFetch(`/person/${person.id}?`);
      return response;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          {person.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
              alt={person.name}
              className="w-32 h-32 rounded-lg object-cover border-4 border-purple-500"
            />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-400">{person.name[0]}</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <h3 className="text-xl font-bold">{person.name}</h3>
            <p className="text-sm text-muted-foreground">
              {person.known_for_department}
            </p>
          </div>

          {creatorDetails && (
            <div className="space-y-3 text-sm">
              {creatorDetails.birthday && (
                <div>
                  <span className="font-semibold text-primary">Birthday: </span>
                  <span>{new Date(creatorDetails.birthday).toLocaleDateString()}</span>
                </div>
              )}
              {creatorDetails.place_of_birth && (
                <div>
                  <span className="font-semibold text-primary">Place of Birth: </span>
                  <span>{creatorDetails.place_of_birth}</span>
                </div>
              )}
              {creatorDetails.biography && (
                <div>
                  <p className="text-muted-foreground line-clamp-3">
                    {creatorDetails.biography}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-center text-sm">
          <p className="text-primary hover:text-primary/80 transition-colors duration-200">
            {t("search.clickToSeeWorks")}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
