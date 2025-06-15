
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button in the top right corner. You can register with your email address or use social login options like Google or Facebook."
        },
        {
          question: "Is MovieFinder free to use?",
          answer: "Yes, MovieFinder is completely free to use. All features including movie recommendations, streaming availability, and watchlist management are available at no cost."
        },
        {
          question: "Do I need to create an account to use MovieFinder?",
          answer: "While you can browse movies without an account, creating one allows you to save favorites, get personalized recommendations, and track your viewing history."
        }
      ]
    },
    {
      category: "Recommendations",
      questions: [
        {
          question: "How do movie recommendations work?",
          answer: "Our AI-powered recommendation system analyzes your viewing history, ratings, and preferences to suggest movies you'll love. The more you interact with the platform, the better recommendations become."
        },
        {
          question: "Can I improve my recommendations?",
          answer: "Yes! Rate movies you've watched, add movies to your favorites, and complete our preference quiz to help us understand your taste better."
        },
        {
          question: "Why am I seeing certain recommendations?",
          answer: "Recommendations are based on various factors including your rated movies, favorite genres, viewing history, and movies similar to ones you've enjoyed."
        }
      ]
    },
    {
      category: "Streaming & Availability",
      questions: [
        {
          question: "How accurate is streaming availability information?",
          answer: "We update streaming availability in real-time from multiple sources. However, availability can change frequently, so we recommend checking the streaming platform directly before watching."
        },
        {
          question: "Which streaming services do you support?",
          answer: "We support major platforms including Netflix, Amazon Prime Video, Disney+, HBO Max, Hulu, Apple TV+, and many more. Coverage varies by region."
        },
        {
          question: "Can I filter movies by streaming service?",
          answer: "Yes! Use our advanced filters to show only movies available on your preferred streaming platforms."
        }
      ]
    },
    {
      category: "Account & Settings",
      questions: [
        {
          question: "How do I manage my watchlist?",
          answer: "Click the heart icon on any movie to add it to your favorites. You can view and manage your complete watchlist from the 'Favorites' page."
        },
        {
          question: "Can I export my data?",
          answer: "Currently, data export is not available, but we're working on this feature. You can always view your favorites and ratings in your account."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team at contact@moviefinder.com to request account deletion. We'll process your request within 7 business days."
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap(category => 
    category.questions.map(q => ({ ...q, category: category.category }))
  );

  const filteredQuestions = allQuestions.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find quick answers to the most common questions about MovieFinder.
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {searchQuery ? (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({filteredQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredQuestions.map((item, index) => (
                  <AccordionItem key={index} value={`search-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div>
                        <div>{item.question}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          Category: {item.category}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, index) => (
                        <AccordionItem key={index} value={`${categoryIndex}-${index}`}>
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default FAQ;
