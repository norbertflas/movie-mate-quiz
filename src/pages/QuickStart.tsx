
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Search, Heart, Star, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const QuickStart = () => {
  const steps = [
    {
      icon: Play,
      title: "Get Started",
      description: "Welcome to MovieFinder! Let's get you set up in just a few minutes.",
      actions: ["Create an account or browse as a guest", "Take our quick preferences quiz"]
    },
    {
      icon: Search,
      title: "Search & Discover",
      description: "Find movies using our powerful search and filtering tools.",
      actions: ["Use the search bar to find specific movies", "Browse by genre, year, or rating", "Apply filters to narrow down results"]
    },
    {
      icon: Heart,
      title: "Save Your Favorites",
      description: "Keep track of movies you want to watch or have enjoyed.",
      actions: ["Click the heart icon to add movies to favorites", "Build your personal watchlist", "Access your favorites anytime"]
    },
    {
      icon: Star,
      title: "Rate Movies",
      description: "Help us improve recommendations by rating movies you've watched.",
      actions: ["Rate movies from 1-5 stars", "Get better personalized recommendations", "See your rating history"]
    },
    {
      icon: Filter,
      title: "Get Recommendations",
      description: "Discover new movies tailored to your taste.",
      actions: ["Take the movie quiz for instant recommendations", "Browse curated lists", "Explore trending and popular movies"]
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Quick Start Guide</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn the basics of MovieFinder and start discovering your next favorite movie in minutes.
          </p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Step {index + 1}</Badge>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                      <ul className="space-y-2">
                        {step.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to Start?</h3>
            <p className="text-muted-foreground">
              Take our movie quiz to get personalized recommendations right away!
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link to="/quiz">Take Movie Quiz</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/search">Browse Movies</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default QuickStart;
