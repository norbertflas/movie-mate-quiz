
import { useState, useEffect } from "react";
import { QuizQuestions } from "./QuizQuestions";
import { QuizResults } from "./QuizResults";
import { QuizProgressBar } from "./QuizProgressBar";
import { useQuizLogic } from "./QuizLogic";
import { QuizAnswer } from "./QuizTypes";
import { useSurveySteps } from "./constants/surveySteps";

export const GroupQuizView = () => {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { processAnswers } = useQuizLogic();
  const questions = useSurveySteps();
  const [currentStep, setCurrentStep] = useState(0);

  // Update answerMap whenever answers change
  useEffect(() => {
    const newAnswerMap = answers.reduce((map, answer) => {
      map[answer.questionId] = answer.answer;
      return map;
    }, {} as Record<string, string>);
    
    setAnswerMap(newAnswerMap);
  }, [answers]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = {
      questionId: questions[currentStep].id,
      answer
    };
    setAnswers(newAnswers);
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleQuizComplete(newAnswers);
    }
  };

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]) => {
    setAnswers(quizAnswers);
    await processAnswers(quizAnswers);
    setShowResults(true);
  };

  if (showResults) {
    return <QuizResults recommendations={[]} isGroupQuiz={true} />;
  }

  return (
    <div className="space-y-8">
      <QuizProgressBar 
        currentStep={answers.length} 
        totalSteps={questions.length} 
      />
      <QuizQuestions
        questions={questions}
        currentStep={currentStep}
        onAnswer={handleAnswer}
        answers={answers}
        answerMap={answerMap}
      />
    </div>
  );
};
