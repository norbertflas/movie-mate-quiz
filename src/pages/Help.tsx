
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, MessageSquare, Book } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign Up' button in the top right corner of the page. You can sign up with your email or use social login options."
    },
    {
      question: "How does the movie recommendation system work?",
      answer: "Our recommendation system uses machine learning algorithms to analyze your viewing history, ratings, and preferences to suggest movies you might enjoy. The more you use the platform, the better the recommendations become."
    },
    {
      question: "Can I see where movies are available to stream?",
      answer: "Yes! We provide real-time streaming availability information for major platforms like Netflix, Amazon Prime, Disney+, and more. This information is updated regularly."
    },
    {
      question: "How do I add movies to my watchlist?",
      answer: "You can add movies to your watchlist by clicking the heart icon on any movie card. You can view and manage your watchlist from the 'Favorites' page."
    },
    {
      question: "Is MovieFinder free to use?",
      answer: "Yes, MovieFinder is completely free to use. All our features including recommendations, streaming availability, and watchlist management are available at no cost."
    },
    {
      question: "How do I rate movies?",
      answer: "You can rate movies by clicking on the star rating on any movie card or in the movie details. Your ratings help improve our recommendation algorithm."
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and get help with using MovieFinder.
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quick Start Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn the basics of using MovieFinder
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Book className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">User Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Detailed documentation and tutorials
              </p>
              <Button variant="outline" size="sm">View Guide</Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get help from our support team
              </p>
              <Button variant="outline" size="sm">Contact Us</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Help;
