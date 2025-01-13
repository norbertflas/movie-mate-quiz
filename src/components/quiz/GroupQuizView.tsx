import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { QuizQuestions } from "./QuizQuestions";
import { QuizProgressBar } from "./QuizProgressBar";
import { QuizResults } from "./QuizResults";
import { useQuizLogic } from "./QuizLogic";
import { QuizAnswer } from "./QuizTypes";
import { QUIZ_QUESTIONS } from "./QuizConstants";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export const GroupQuizView = () => {
  const { groupId } = useParams();
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const { processAnswers } = useQuizLogic();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const checkGroupExists = async () => {
      const { data, error } = await supabase
        .from("quiz_groups")
        .select()
        .eq("id", groupId)
        .single();

      if (error || !data) {
        toast({
          title: t("errors.notFound"),
          description: t("errors.groupNotFound"),
          variant: "destructive",
        });
      }
    };

    checkGroupExists();
  }, [groupId]);

  const handleQuizComplete = async (quizAnswers: QuizAnswer[]) => {
    try {
      const { error } = await supabase
        .from("quiz_responses")
        .insert({
          group_id: groupId,
          answers: quizAnswers,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      setAnswers(quizAnswers);
      setShowResults(true);
    } catch (error) {
      toast({
        title: t("errors.savingResponse"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };

  if (showResults) {
    const recommendations = processAnswers(answers);
    return <QuizResults recommendations={recommendations} isGroupQuiz />;
  }

  return (
    <div className="space-y-8">
      <QuizProgressBar 
        currentStep={answers.length} 
        totalSteps={QUIZ_QUESTIONS.length} 
      />
      <QuizQuestions
        questions={QUIZ_QUESTIONS}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};