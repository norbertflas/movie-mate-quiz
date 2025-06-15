
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useComprehensiveQuizLogic } from "./hooks/useComprehensiveQuizLogic";
import { ComprehensiveQuizResults } from "./ComprehensiveQuizResults";
import type { QuizPreferences } from "./types/comprehensiveQuizTypes";

const QUIZ_QUESTIONS = [
  {
    id: "platforms",
    title: "Which streaming platforms do you have access to?",
    subtitle: "Select all that apply",
    type: "multiple",
    options: [
      "Netflix",
      "Amazon Prime Video", 
      "Disney+",
      "Hulu",
      "HBO Max",
      "Apple TV+",
      "Paramount+",
      "I don't have a preference"
    ]
  },
  {
    id: "genres",
    title: "What are your favorite movie genres?",
    subtitle: "Choose up to 3 genres",
    type: "multiple",
    maxSelections: 3,
    options: [
      "Action",
      "Comedy", 
      "Drama",
      "Horror",
      "Sci-Fi",
      "Romance",
      "Thriller",
      "Animation",
      "Documentary",
      "Fantasy"
    ]
  },
  {
    id: "era",
    title: "What movie era do you prefer?",
    subtitle: "Select one option",
    type: "single",
    options: [
      "Latest releases (2020-2024)",
      "Modern classics (2010-2019)",
      "Golden era (2000-2009)",
      "Vintage movies (before 2000)",
      "No preference"
    ]
  },
  {
    id: "length",
    title: "How long should your movies be?",
    subtitle: "Select your preferred movie length",
    type: "single",
    options: [
      "Short movies (under 90 min)",
      "Standard length (90-120 min)", 
      "Long movies (120+ min)",
      "No preference"
    ]
  },
  {
    id: "rating",
    title: "What content rating do you prefer?",
    subtitle: "Choose your comfort level",
    type: "single",
    options: [
      "Family-friendly (G, PG)",
      "Teen appropriate (PG-13)",
      "Adult content (R)",
      "No preference"
    ]
  }
];

export const ComprehensiveQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<QuizPreferences>({
    platforms: [],
    genres: [],
    era: "",
    length: "",
    rating: ""
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});

  const {
    recommendations,
    isLoading,
    isComplete,
    error,
    getRecommendations
  } = useComprehensiveQuizLogic();

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    setSelectedAnswers(prev => {
      const current = prev[questionId] || [];
      
      if (question.type === "single") {
        return { ...prev, [questionId]: [answer] };
      } else {
        // Multiple selection
        const maxSelections = question.maxSelections || Infinity;
        
        if (current.includes(answer)) {
          return { ...prev, [questionId]: current.filter(a => a !== answer) };
        } else if (current.length < maxSelections) {
          return { ...prev, [questionId]: [...current, answer] };
        }
        return prev;
      }
    });
  };

  const handleNext = () => {
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const finalPreferences: QuizPreferences = {
      platforms: selectedAnswers.platforms || [],
      genres: selectedAnswers.genres || [],
      era: selectedAnswers.era?.[0] || "",
      length: selectedAnswers.length?.[0] || "",
      rating: selectedAnswers.rating?.[0] || ""
    };

    setPreferences(finalPreferences);
    await getRecommendations(finalPreferences);
  };

  const canProceed = () => {
    const currentAnswers = selectedAnswers[currentQuestion.id] || [];
    return currentAnswers.length > 0;
  };

  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;

  if (isComplete && recommendations.length > 0) {
    return (
      <ComprehensiveQuizResults 
        recommendations={recommendations}
        preferences={preferences}
        onRetakeQuiz={() => {
          setCurrentStep(0);
          setSelectedAnswers({});
          setPreferences({
            platforms: [],
            genres: [],
            era: "",
            length: "",
            rating: ""
          });
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-black text-white border-gray-800">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                Movie Recommendation Quiz
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-600">
                {currentStep + 1} of {QUIZ_QUESTIONS.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {currentQuestion.title}
                </h3>
                <p className="text-gray-400">
                  {currentQuestion.subtitle}
                </p>
                {currentQuestion.maxSelections && (
                  <p className="text-sm text-yellow-400">
                    Maximum {currentQuestion.maxSelections} selections
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswers[currentQuestion.id]?.includes(option) || false;
                  
                  return (
                    <motion.button
                      key={option}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-500/20 text-white"
                          : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option}</span>
                        {isSelected && (
                          <Check className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting Recommendations...
                </>
              ) : isLastStep ? (
                <>
                  Get Recommendations
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
