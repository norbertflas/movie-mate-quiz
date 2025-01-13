import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizSection } from "../QuizSection";
import { MovieCard } from "../MovieCard";
import { getRecommendations } from "./QuizLogic";

interface GroupQuizData {
  id: string;
  name: string;
  status: string;
  created_by: string;
  responses: Array<{
    user_id: string;
    answers: Record<string, any>;
  }>;
}

export const GroupQuizView = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [groupData, setGroupData] = useState<GroupQuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const { data: group, error: groupError } = await supabase
        .from("quiz_groups")
        .select("*")
        .eq("id", groupId)
        .single();

      if (groupError) throw groupError;

      const { data: responses, error: responsesError } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("group_id", groupId);

      if (responsesError) throw responsesError;

      const user = await supabase.auth.getUser();
      const userResponse = responses?.find(
        (r) => r.user_id === user.data.user?.id
      );

      setGroupData({
        ...group,
        responses: responses?.map(r => ({
          user_id: r.user_id,
          answers: r.answers as Record<string, any>
        })) || [],
      });
      
      setHasResponded(!!userResponse);
    } catch (error) {
      console.error("Error fetching group data:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych grupy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: Record<string, any>) => {
    try {
      const user = await supabase.auth.getUser();
      const { error } = await supabase.from("quiz_responses").insert({
        group_id: groupId,
        user_id: user.data.user!.id,
        answers,
      });

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Twoje odpowiedzi zostały zapisane",
      });

      setHasResponded(true);
      fetchGroupData();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać odpowiedzi",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (!groupData) {
    return <div>Nie znaleziono grupy</div>;
  }

  const getGroupRecommendations = () => {
    const allAnswers = groupData.responses.map((r) => r.answers);
    // Combine all answers and get recommendations that match everyone's preferences
    const combinedRecommendations = getRecommendations(
      allAnswers.reduce((acc, curr) => ({
        ...acc,
        ...curr,
      }))
    );
    return combinedRecommendations;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{groupData.name}</h2>
        <div className="space-y-4">
          <p>
            Liczba odpowiedzi: {groupData.responses.length}
          </p>
          {!hasResponded ? (
            <div>
              <p className="mb-4">
                Wypełnij quiz, aby zobaczyć wspólne rekomendacje!
              </p>
              <QuizSection onSubmit={handleQuizSubmit} />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Wspólne rekomendacje:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getGroupRecommendations().map((movie) => (
                  <MovieCard key={movie.title} {...movie} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};