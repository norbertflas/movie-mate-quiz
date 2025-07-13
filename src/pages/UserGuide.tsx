
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Heart, Star, Filter, Settings, User, Tv } from "lucide-react";
import { motion } from "framer-motion";

const UserGuide = () => {
  const guides = [
    {
      id: "search",
      title: "Search & Discovery",
      icon: Search,
      content: [
        {
          title: "Basic Search",
          description: "Use the search bar to find movies by title, actor, or director. Our smart search will suggest movies as you type."
        },
        {
          title: "Advanced Filters",
          description: "Click the filter button to narrow results by genre, year, rating, streaming service, and more."
        },
        {
          title: "Browse Categories",
          description: "Explore curated lists like trending, popular, top-rated, and recently added movies."
        }
      ]
    },
    {
      id: "favorites",
      title: "Favorites & Watchlist",
      icon: Heart,
      content: [
        {
          title: "Adding Favorites",
          description: "Click the heart icon on any movie card to add it to your favorites list."
        },
        {
          title: "Managing Your List",
          description: "View all your favorites in the Favorites page. Remove items by clicking the heart again."
        },
        {
          title: "Sync Across Devices",
          description: "Your favorites are saved to your account and sync across all your devices."
        }
      ]
    },
    {
      id: "ratings",
      title: "Rating System",
      icon: Star,
      content: [
        {
          title: "Rating Movies",
          description: "Rate movies from 1-5 stars by clicking on the star rating on movie cards."
        },
        {
          title: "Improving Recommendations",
          description: "Your ratings help our AI provide better personalized movie recommendations."
        },
        {
          title: "Rating History",
          description: "View all your rated movies in the Ratings page and update ratings anytime."
        }
      ]
    },
    {
      id: "streaming",
      title: "Streaming Services",
      icon: Tv,
      content: [
        {
          title: "Availability Information",
          description: "See where each movie is available to stream, rent, or buy in real-time."
        },
        {
          title: "Service Preferences",
          description: "Set your preferred streaming services to see availability at a glance."
        },
        {
          title: "Regional Content",
          description: "Streaming availability is shown for your region automatically."
        }
      ]
    },
    {
      id: "recommendations",
      title: "Recommendations",
      icon: Filter,
      content: [
        {
          title: "Movie Quiz",
          description: "Take our comprehensive quiz to get instant personalized recommendations."
        },
        {
          title: "AI Recommendations",
          description: "Our machine learning algorithms analyze your preferences to suggest new movies."
        },
        {
          title: "Similar Movies",
          description: "Find movies similar to ones you've enjoyed using our recommendation engine."
        }
      ]
    },
    {
      id: "account",
      title: "Account Settings",
      icon: User,
      content: [
        {
          title: "Profile Management",
          description: "Update your profile information and movie preferences in account settings."
        },
        {
          title: "Privacy Controls",
          description: "Manage your privacy settings and data sharing preferences."
        },
        {
          title: "Notification Settings",
          description: "Choose which notifications you want to receive about new movies and features."
        }
      ]
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
          <h1 className="text-4xl font-bold">User Guide</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guide to using all MovieFinder features and getting the most out of your movie discovery experience.
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-1 h-auto p-1">
                {guides.map((guide) => (
                  <TabsTrigger 
                    key={guide.id} 
                    value={guide.id} 
                    className="flex flex-col items-center gap-2 py-3 px-2 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <guide.icon className="h-4 w-4" />
                    <span className="text-center leading-tight">{guide.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {guides.map((guide, guideIndex) => (
                <TabsContent key={guide.id} value={guide.id} className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <guide.icon className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-semibold">{guide.title}</h2>
                    </div>

                    <div className="space-y-6">
                      {guide.content.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{index + 1}</Badge>
                              <h3 className="text-lg font-medium">{item.title}</h3>
                            </div>
                            <p className="text-muted-foreground ml-8 leading-relaxed">{item.description}</p>
                            {index < guide.content.length - 1 && <Separator className="ml-8" />}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tips for Best Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">For Better Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Rate as many movies as possible</li>
                  <li>• Update your preferences regularly</li>
                  <li>• Take the quiz multiple times</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">For Faster Discovery</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Use specific search terms</li>
                  <li>• Apply multiple filters</li>
                  <li>• Browse trending lists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default UserGuide;
