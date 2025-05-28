
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, Calendar, Star, Trending } from "lucide-react";
import { MovieClub } from "../types/SocialTypes";

interface MovieClubCardProps {
  club: MovieClub;
  onJoin: (clubId: string) => void;
  onViewDetails: (clubId: string) => void;
  isMember?: boolean;
}

export const MovieClubCard: React.FC<MovieClubCardProps> = ({
  club,
  onJoin,
  onViewDetails,
  isMember = false
}) => {
  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'genre': return '🎭';
      case 'decade': return '📅';
      case 'director': return '🎬';
      default: return '🎪';
    }
  };

  const getThemeDescription = () => {
    if (club.theme === 'genre' && club.themeDetails?.genre) {
      return `${club.themeDetails.genre} Movies`;
    }
    if (club.theme === 'decade' && club.themeDetails?.decade) {
      return `${club.themeDetails.decade}s Movies`;
    }
    if (club.theme === 'director' && club.themeDetails?.director) {
      return `${club.themeDetails.director} Films`;
    }
    return 'General Discussion';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getThemeIcon(club.theme)}</span>
              <div>
                <CardTitle className="text-lg">{club.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getThemeDescription()}
                </p>
              </div>
            </div>
            <Badge variant={club.isPublic ? "secondary" : "outline"}>
              {club.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {club.description}
          </p>

          {/* Tags */}
          {club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {club.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {club.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{club.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{club.memberCount} members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span>{club.stats.averageRating.toFixed(1)} avg rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span>{club.stats.totalMoviesWatched} movies</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{club.lastActivity.toLocaleDateString()}</span>
            </div>
          </div>

          {/* Current Discussion */}
          {club.currentDiscussion && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-1">Current Discussion</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {club.currentDiscussion.title}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {club.currentDiscussion.participantCount} participants
                </Badge>
                {club.currentDiscussion.isPinned && (
                  <Badge variant="outline" className="text-xs">
                    📌 Pinned
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Movies */}
          {club.upcomingMovies.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Upcoming</h4>
              <div className="space-y-2">
                {club.upcomingMovies.slice(0, 2).map((movie, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${movie.poster}`}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{movie.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {movie.scheduledDate.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {movie.votes} votes
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails(club.id)}
            >
              View Details
            </Button>
            {!isMember && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onJoin(club.id)}
              >
                Join Club
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
