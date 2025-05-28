
import { useState, useEffect } from "react";
import { QuizResults } from "./QuizResults";
import { QuizQuestions } from "./QuizQuestions";
import { QuizProgressBar } from "./QuizProgressBar";
import { useQuizLogic } from "./QuizLogic";
import { useSurveySteps } from "./constants/surveySteps";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { QuizAnswer } from "./QuizTypes";

export const QuizSection = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showLocalResults, setShowLocalResults] = useState(false);
  const [localRecommendations, setLocalRecommendations] = useState([]);
  const steps = useSurveySteps();
  
  const { 
    showResults,
    recommendations,
    handleQuizComplete 
  } = useQuizLogic();

  // Get visible steps based on current answers
  const visibleSteps = steps.filter(step => !step.shouldShow || step.shouldShow(answerMap));
  const totalSteps = visibleSteps.length;

  // Update answer map whenever answers change
  useEffect(() => {
    const newAnswerMap = answers.reduce((map, answer) => {
      map[answer.questionId] = answer.answer;
      return map;
    }, {} as Record<string, string>);
    
    setAnswerMap(newAnswerMap);
  }, [answers]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = steps[currentStep];
    if (!currentQuestion) return;

    console.log(`📝 Quiz answer: ${currentQuestion.id} = ${answer}`);

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer
    };
    
    // Update answers
    setAnswers(prev => {
      const newAnswers = [...prev];
      const existingIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
      
      if (existingIndex >= 0) {
        newAnswers[existingIndex] = newAnswer;
      } else {
        newAnswers.push(newAnswer);
      }
      
      console.log('📋 Updated answers:', newAnswers);
      return newAnswers;
    });
  };

  // Get the next visible step index
  const getNextVisibleStep = (startIndex: number): number => {
    let nextIndex = startIndex + 1;
    
    while (nextIndex < steps.length) {
      const step = steps[nextIndex];
      if (!step.shouldShow || step.shouldShow(answerMap)) {
        return nextIndex;
      }
      nextIndex++;
    }
    
    return startIndex; // If no next visible step, return current
  };

  // Get the previous visible step index
  const getPreviousVisibleStep = (startIndex: number): number => {
    let prevIndex = startIndex - 1;
    
    while (prevIndex >= 0) {
      const step = steps[prevIndex];
      if (!step.shouldShow || step.shouldShow(answerMap)) {
        return prevIndex;
      }
      prevIndex--;
    }
    
    return startIndex; // If no previous visible step, return current
  };

  const handleNext = async () => {
    const currentQuestion = steps[currentStep];
    if (!currentQuestion) return;
    
    // Check if we have an answer for the current step
    const hasCurrentAnswer = answers.some(a => a.questionId === currentQuestion.id);
    
    if (!hasCurrentAnswer) {
      toast({
        title: t("errors.missingAnswer") || "Missing Answer",
        description: t("errors.pleaseSelectOption") || "Please select an option",
        variant: "destructive",
      });
      return;
    }

    const isLastStep = !steps.some((step, index) => 
      index > currentStep && (!step.shouldShow || step.shouldShow(answerMap))
    );
    
    if (isLastStep) {
      await handleFinish();
    } else {
      const nextStep = getNextVisibleStep(currentStep);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const prevStep = getPreviousVisibleStep(currentStep);
    setCurrentStep(prevStep);
  };

  const handleFinish = async () => {
    try {
      setIsSubmitting(true);
      console.log('🏁 Finishing quiz with answers:', answers);
      
      const results = await handleQuizComplete(answers);
      console.log('✅ Quiz completed with results:', results);
      
      // Set local results to show them immediately
      setLocalRecommendations(results);
      setShowLocalResults(true);
      
      toast({
        title: t("quiz.completed") || "Quiz Completed!",
        description: t("quiz.recommendations.ready") || "Your recommendations are ready!",
      });
    } catch (error) {
      console.error('💥 Error submitting quiz:', error);
      toast({
        title: t("errors.quizError") || "Quiz Error",
        description: t("errors.tryAgain") || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the current visible step index (for progress calculation)
  const getCurrentVisibleStepIndex = (): number => {
    let visibleIndex = 0;
    
    for (let i = 0; i < currentStep; i++) {
      const step = steps[i];
      if (!step.shouldShow || step.shouldShow(answerMap)) {
        visibleIndex++;
      }
    }
    
    return visibleIndex;
  };

  const visibleStepIndex = getCurrentVisibleStepIndex();
  const isLastStep = visibleStepIndex >= totalSteps - 1;

  // Show results if we have local results or global results
  if (showLocalResults && localRecommendations && localRecommendations.length > 0) {
    return <QuizResults recommendations={localRecommendations} isGroupQuiz={false} />;
  }

  if (showResults && recommendations && recommendations.length > 0) {
    return <QuizResults recommendations={recommendations} isGroupQuiz={false} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black text-white rounded-xl overflow-hidden"
      >
        <div className="p-6">
          <QuizQuestions
            questions={steps}
            currentStep={currentStep}
            onAnswer={handleAnswer}
            answers={answers}
            answerMap={answerMap}
          />
          
          <div className="mt-12">
            <QuizProgressBar 
              currentStep={visibleStepIndex + 1} 
              totalSteps={totalSteps} 
            />
          </div>
          
          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="text-white bg-gray-800 border-gray-700 hover:bg-gray-700 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("quiz.previous") || "Previous"}
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!answers.some(a => a.questionId === steps[currentStep]?.id) || isSubmitting}
              className={`ml-auto flex items-center gap-2 ${currentStep === 0 ? 'mx-auto' : ''} bg-blue-600 hover:bg-blue-700`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("quiz.processing") || "Processing..."}
                </>
              ) : isLastStep ? (
                <>
                  {t("quiz.finish") || "Finish"}
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t("quiz.next") || "Next"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
