import { useState } from "react";
import { SurveyStep } from "./SurveyStep";
import { MovieCard } from "./MovieCard";
import { motion, AnimatePresence } from "framer-motion";

const VOD_SERVICES = [
  "Netflix",
  "HBO Max",
  "Disney+",
  "Amazon Prime",
  "Apple TV+",
  "Canal+",
  "SkyShowtime",
  "Player",
];

type SurveyStepType = {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  getDynamicOptions?: (answers: Record<string, any>) => string[];
  shouldShow?: (answers: Record<string, any>) => boolean;
};

const SURVEY_STEPS: SurveyStepType[] = [
  {
    id: "vod",
    question: "Wybierz serwisy VOD, z których korzystasz:",
    type: "multiple",
    options: VOD_SERVICES,
  },
  {
    id: "type",
    question: "Co Cię interesuje?",
    type: "single",
    options: ["Film", "Serial"],
  },
  {
    id: "length",
    question: "Preferowana długość:",
    type: "single",
    options: [],
    getDynamicOptions: (answers: Record<string, any>) => {
      if (answers.type === "Film") {
        return ["Do 1.5h", "1.5h - 2h", "Powyżej 2h"];
      }
      return ["20-30 min", "40-50 min", "Powyżej 1h"];
    },
  },
  {
    id: "seasons",
    question: "Preferowana ilość sezonów:",
    type: "single",
    options: ["1 sezon", "2-3 sezony", "4+ sezonów"],
    shouldShow: (answers: Record<string, any>) => answers.type === "Serial",
  },
  {
    id: "genre",
    question: "Jaki gatunek Cię interesuje?",
    type: "single",
    options: [
      "Akcja",
      "Komedia",
      "Dramat",
      "Sci-Fi",
      "Horror",
      "Romans",
      "Thriller",
      "Dokument",
    ],
  },
  {
    id: "mood",
    question: "Jaki nastrój Cię interesuje?",
    type: "single",
    options: [
      "Lekki/Zabawny",
      "Poważny/Dramatyczny",
      "Trzymający w napięciu",
      "Inspirujący",
    ],
  },
];

export const SAMPLE_RECOMMENDATIONS = [
  {
    title: "Stranger Things",
    year: "2016",
    platform: "Netflix",
    genre: "Sci-Fi",
    imageUrl: "https://picsum.photos/seed/movie1/400/225",
    description:
      "Gdy chłopiec znika w małym miasteczku, jego przyjaciele, rodzina i policja zostają wciągnięci w serię tajemniczych wydarzeń.",
    trailerUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
    rating: 8.7,
  },
  {
    title: "The Last of Us",
    year: "2023",
    platform: "HBO Max",
    genre: "Dramat",
    imageUrl: "https://picsum.photos/seed/movie2/400/225",
    description:
      "W świecie spustoszonym przez pandemię, ocalały przemytnik Joel zostaje zatrudniony do wyprowadzenia 14-letniej dziewczynki ze strefy kwarantanny.",
    trailerUrl: "https://www.youtube.com/embed/uLtkt8BonwM",
    rating: 8.8,
  },
  {
    title: "The Mandalorian",
    year: "2019",
    platform: "Disney+",
    genre: "Akcja",
    imageUrl: "https://picsum.photos/seed/movie3/400/225",
    description:
      "Samotny łowca nagród przemierza najdalsze zakątki galaktyki, z dala od władzy Nowej Republiki.",
    trailerUrl: "https://www.youtube.com/embed/aOC8E8z_ifw",
    rating: 8.7,
  },
  {
    title: "The Boys",
    year: "2019",
    platform: "Amazon Prime",
    genre: "Akcja",
    imageUrl: "https://picsum.photos/seed/movie4/400/225",
    description:
      "Grupa samozwańczych mścicieli postanawia rozprawić się z superbohaterami, którzy nadużywają swoich mocy.",
    trailerUrl: "https://www.youtube.com/embed/M1bhOaLV4FU",
    rating: 8.7,
  },
  {
    title: "Ted Lasso",
    year: "2020",
    platform: "Apple TV+",
    genre: "Komedia",
    imageUrl: "https://picsum.photos/seed/movie5/400/225",
    description:
      "Amerykański trener futbolu zostaje zatrudniony do prowadzenia angielskiej drużyny piłkarskiej.",
    trailerUrl: "https://www.youtube.com/embed/3u7EIiohs6U",
    rating: 8.8,
  },
];

export const QuizSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (option: string) => {
    const currentQuestion = SURVEY_STEPS[currentStep];

    if (currentQuestion.type === "multiple") {
      if (option === "NEXT_STEP") {
        if (currentStep < SURVEY_STEPS.length - 1) {
          const nextStep = currentStep + 1;
          const nextQuestion = SURVEY_STEPS[nextStep];
          if (nextQuestion.shouldShow && !nextQuestion.shouldShow(answers)) {
            setCurrentStep(nextStep + 1);
          } else {
            setCurrentStep(nextStep);
          }
        } else {
          setShowResults(true);
        }
      } else {
        const currentAnswers = answers[currentQuestion.id] || [];
        const updatedAnswers = currentAnswers.includes(option)
          ? currentAnswers.filter((item: string) => item !== option)
          : [...currentAnswers, option];

        setAnswers({
          ...answers,
          [currentQuestion.id]: updatedAnswers,
        });
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: option,
      });

      if (currentStep < SURVEY_STEPS.length - 1) {
        const nextStep = currentStep + 1;
        const nextQuestion = SURVEY_STEPS[nextStep];

        if (nextQuestion.shouldShow && !nextQuestion.shouldShow(answers)) {
          setCurrentStep(nextStep + 1);
        } else {
          setCurrentStep(nextStep);
        }
      } else {
        setShowResults(true);
      }
    }
  };

  const currentQuestion = SURVEY_STEPS[currentStep];
  const options = currentQuestion.getDynamicOptions
    ? currentQuestion.getDynamicOptions(answers)
    : currentQuestion.options;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <SurveyStep
              key={currentStep}
              question={currentQuestion.question}
              options={options}
              onSelect={handleSelect}
              currentStep={currentStep + 1}
              totalSteps={SURVEY_STEPS.length}
              type={currentQuestion.type}
              selectedOptions={answers[currentQuestion.id] || []}
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
                {SAMPLE_RECOMMENDATIONS.filter((movie) =>
                  answers.vod.includes(movie.platform)
                ).map((movie) => (
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
