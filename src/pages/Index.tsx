import { useState } from "react";
import { SurveyStep } from "@/components/SurveyStep";
import { MovieCard } from "@/components/MovieCard";
import { motion, AnimatePresence } from "framer-motion";

const SURVEY_STEPS = [
  {
    question: "Wybierz serwisy VOD, z których korzystasz:",
    options: ["Netflix", "HBO Max", "Disney+", "Amazon Prime"],
  },
  {
    question: "Jaki gatunek filmu/serialu Cię interesuje?",
    options: ["Akcja", "Komedia", "Dramat", "Sci-Fi", "Horror", "Romans"],
  },
  {
    question: "Preferowana długość:",
    options: ["Film (do 2.5h)", "Serial (1 sezon)", "Serial (wiele sezonów)"],
  },
  {
    question: "Jaki nastrój Cię interesuje?",
    options: ["Lekki/Zabawny", "Poważny/Dramatyczny", "Trzymający w napięciu", "Inspirujący"],
  },
];

// Przykładowe dane filmów (w prawdziwej aplikacji pobierane z API)
const SAMPLE_MOVIES = [
  {
    title: "Stranger Things",
    year: "2016",
    platform: "Netflix",
    genre: "Sci-Fi",
    imageUrl: "https://picsum.photos/seed/movie1/400/225",
  },
  {
    title: "The Last of Us",
    year: "2023",
    platform: "HBO Max",
    genre: "Dramat",
    imageUrl: "https://picsum.photos/seed/movie2/400/225",
  },
  {
    title: "The Mandalorian",
    year: "2019",
    platform: "Disney+",
    genre: "Akcja",
    imageUrl: "https://picsum.photos/seed/movie3/400/225",
  },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (currentStep < SURVEY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="survey-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Znajdź idealny film lub serial
          </h1>
          <p className="text-lg text-muted-foreground">
            Odpowiedz na kilka pytań, a my pomożemy Ci wybrać coś dla Ciebie
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <SurveyStep
              key={currentStep}
              question={SURVEY_STEPS[currentStep].question}
              options={SURVEY_STEPS[currentStep].options}
              onSelect={handleSelect}
              currentStep={currentStep + 1}
              totalSteps={SURVEY_STEPS.length}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Twoje rekomendacje:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_MOVIES.map((movie) => (
                  <MovieCard key={movie.title} {...movie} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;