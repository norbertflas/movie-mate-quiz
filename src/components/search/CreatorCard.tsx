
import { motion } from "framer-motion";
import type { TMDBPerson } from "@/services/tmdb";
import { format } from "date-fns";
import { CalendarDays, MapPin, ScrollText, Award, Film, Heart } from "lucide-react";
import { useLocation } from "react-router-dom";

interface CreatorCardProps {
  person: TMDBPerson;
  index: number;
  onClick: () => void;
}

export const CreatorCard = ({ person, index, onClick }: CreatorCardProps) => {
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "d MMMM yyyy");
    } catch {
      return "";
    }
  };

  const highlightAchievements = (biography?: string) => {
    if (!biography) return [];
    const achievements = [];
    
    if (biography.toLowerCase().includes('oscar') || 
        biography.toLowerCase().includes('academy award') ||
        biography.toLowerCase().includes('golden globe') ||
        biography.toLowerCase().includes('emmy')) {
      achievements.push("Award-winning artist");
    }
    
    if (biography.toLowerCase().includes('best known for') || 
        biography.toLowerCase().includes('famous for')) {
      achievements.push("Notable works in the industry");
    }
    
    if (biography.toLowerCase().includes('breakthrough') || 
        biography.toLowerCase().includes('milestone')) {
      achievements.push("Career-defining achievements");
    }
    
    return achievements;
  };

  const achievements = highlightAchievements(person.biography);

  const getDepartmentTranslation = (department?: string) => {
    if (!department) return "";
    const deptMap: { [key: string]: string } = {
      "Acting": "Acting",
      "Directing": "Directing",
      "Writing": "Writing", 
      "Production": "Production"
    };
    return deptMap[department] || department;
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
          <div className="mb-4">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              {person.name}
            </h3>
            <p className="text-lg font-medium text-purple-500 mt-1">
              {getDepartmentTranslation(person.known_for_department)}
            </p>
          </div>

          {/* Key Achievements section */}
          {isSearchPage && achievements.length > 0 && (
            <div className="mb-4 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
              <h4 className="text-sm font-medium text-purple-500 mb-2">Career Highlights</h4>
              <ul className="space-y-2">
                {achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span className="text-muted-foreground">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General information section */}
          <div className="space-y-3 mb-4">
            {person.birthday && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">Born:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(person.birthday)}
                </span>
              </div>
            )}
            
            {person.place_of_birth && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">From:</span>
                <span className="text-sm text-muted-foreground">
                  {person.place_of_birth}
                </span>
              </div>
            )}
          </div>

          {/* Biography section */}
          {person.biography && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="h-4 w-4 text-purple-500" />
                <h4 className="text-sm font-medium text-purple-500">Biography</h4>
              </div>
              <p className={`text-sm text-muted-foreground ${isSearchPage ? 'line-clamp-6' : 'line-clamp-2'}`}>
                {person.biography}
              </p>
            </div>
          )}

          {/* Known for section */}
          {person.known_for && person.known_for.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Film className="h-4 w-4 text-purple-500" />
                <h4 className="text-sm font-medium text-purple-500">
                  Known for
                </h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                {person.known_for.slice(0, 3).map((work: any) => (
                  <li key={work.id} className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-purple-500" />
                    <span className="font-medium text-purple-500/90">{work.title || work.name}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-purple-500 hover:text-purple-600 transition-colors">
                Click to see complete filmography
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
