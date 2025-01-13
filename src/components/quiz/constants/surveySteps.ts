import { VOD_SERVICES } from "./streamingServices";
import type { SurveyStepType } from "../QuizTypes";

export const SURVEY_STEPS: SurveyStepType[] = [
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

export const QUIZ_QUESTIONS = SURVEY_STEPS;