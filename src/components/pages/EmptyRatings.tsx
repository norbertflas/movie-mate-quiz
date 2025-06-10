
import { motion } from "framer-motion";
import { Star, Search, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const EmptyRatings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto text-center"
      >
        <Card className="p-8 space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Star className="w-10 h-10 text-primary" />
          </motion.div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              No Ratings Yet
            </h1>
            <p className="text-muted-foreground text-lg">
              Start rating movies to track your preferences
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rate movies by clicking on them and selecting your rating
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Movies
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Browse Popular
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
