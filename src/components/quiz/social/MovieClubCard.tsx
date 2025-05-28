
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageCircle, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface MovieClub {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  currentMovie: {
    title: string;
    poster: string;
    rating: number;
  };
  discussionCount: number;
  trending: boolean;
  lastActivity: Date;
  creator: {
    name: string;
    avatar: string;
  };
}

interface MovieClubCardProps {
  club: MovieClub;
  onJoin?: (clubId: string) => void;
  onViewDetails?: (clubId: string) => void;
}

export const MovieClubCard = ({ club, onJoin, onViewDetails }: MovieClubCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={club.creator.avatar} />
                <AvatarFallback>{club.creator.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-sm text-muted-foreground">
                by {club.creator.name}
              </div>
            </div>
            {club.trending && (
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg leading-tight">{club.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {club.description}
          </p>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{club.memberCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{club.discussionCount}</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Currently Watching</div>
            <div className="flex items-center space-x-2">
              <img 
                src={club.currentMovie.poster} 
                alt={club.currentMovie.title}
                className="w-8 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {club.currentMovie.title}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{club.currentMovie.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(club.id);
              }}
            >
              View Details
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.(club.id);
              }}
            >
              Join Club
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
