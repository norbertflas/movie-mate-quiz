
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Heart, Globe } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">About MovieFinder</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your next favorite movie with personalized recommendations and comprehensive streaming availability.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                MovieFinder helps you discover your next favorite movie across all streaming platforms. 
                We provide personalized recommendations based on your preferences and make it easy to find 
                where to watch any movie.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We're a passionate team of movie enthusiasts and developers dedicated to creating 
                the best movie discovery experience. Our goal is to help you spend less time searching 
                and more time watching great movies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                What We Do
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Personalized movie recommendations</li>
                <li>• Real-time streaming availability</li>
                <li>• Advanced filtering and search</li>
                <li>• Movie ratings and reviews</li>
                <li>• Watchlist management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                MovieFinder serves movie lovers worldwide, providing localized content and 
                streaming availability for different regions. We're constantly expanding 
                our database and improving our recommendation algorithms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default About;
