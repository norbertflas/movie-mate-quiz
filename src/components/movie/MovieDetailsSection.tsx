import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface MovieDetailsSectionProps {
  title: string;
  year: string;
  description: string;
  rating: number;
  genre: string;
  tags?: string[];
}

export const MovieDetailsSection = ({
  title,
  year,
  description,
  rating,
  genre,
  tags,
}: MovieDetailsSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{year}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{genre}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{rating}/100</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </div>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
};