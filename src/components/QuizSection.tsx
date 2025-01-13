import { useQuizLogic } from "@/components/quiz/QuizLogic";
import { QuizResults } from "@/components/quiz/QuizResults";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { NavigationButtons } from "@/components/quiz/NavigationButtons";
import { QuizQuestions } from "@/components/quiz/QuizQuestions";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const QuizSection = () => {
  const { t } = useTranslation();
  const { recommendations, processAnswers } = useQuizLogic();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (answer) => {
    setAnswers((prev) => [...prev, { questionId: currentQuestionIndex, answer }]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      processAnswers(answers);
    }
  };

  const questions = [
    // Define your quiz questions here
  ];

  return (
    <div className="quiz-section">
      {currentQuestionIndex < questions.length ? (
        <QuizQuestions
          question={questions[currentQuestionIndex]}
          onAnswer={handleAnswer}
        />
      ) : (
        <QuizResults recommendations={recommendations} />
      )}
      <NavigationButtons
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onNext={() => setCurrentQuestionIndex((prev) => prev + 1)}
        onPrevious={() => setCurrentQuestionIndex((prev) => prev - 1)}
      />
      <QuizProgress currentQuestionIndex={currentQuestionIndex} totalQuestions={questions.length} />
    </div>
  );
};

export default QuizSection;
