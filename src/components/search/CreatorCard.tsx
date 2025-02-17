
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
      className="bg-gradient-to-br from-card to-card/95 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-purple-500/10 hover:border-purple-500/20 hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          {person.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
              alt={person.name}
              className="w-32 h-32 rounded-lg object-cover shadow-md ring-2 ring-purple-500/50 ring-offset-2 ring-offset-background"
            />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shadow-md">
              <span className="text-3xl font-semibold text-purple-500/70">{person.name[0]}</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              {person.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {person.known_for_department}
            </p>
          </div>

          {creatorDetails && (
            <div className="space-y-3 text-sm">
              {creatorDetails.birthday && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-purple-500">Birthday:</span>
                  <span className="text-muted-foreground">
                    {new Date(creatorDetails.birthday).toLocaleDateString()}
                  </span>
                </div>
              )}
              {creatorDetails.place_of_birth && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-purple-500">Place of Birth:</span>
                  <span className="text-muted-foreground">{creatorDetails.place_of_birth}</span>
                </div>
              )}
              {creatorDetails.biography && (
                <div>
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {creatorDetails.biography}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-purple-500/10">
        <div className="text-center">
          <p className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 font-medium text-sm transition-colors duration-200">
            View {person.name}'s Best Works →
          </p>
        </div>
      </div>
    </motion.div>
  );
};
