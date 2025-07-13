import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CreateGroupQuiz = () => {
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa grupy jest wymagana",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const user = await supabase.auth.getUser();
      const { data: group, error } = await supabase
        .from("quiz_groups")
        .insert({
          name: groupName,
          created_by: user.data.user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sukces!",
        description: "Grupa została utworzona. Możesz teraz udostępnić link znajomym.",
      });

      navigate(`/quiz/group/${group.id}`);
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć grupy. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Utwórz grupowy quiz</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium mb-2">
            Nazwa grupy
          </label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="np. Wieczór filmowy"
          />
        </div>
        <Button
          onClick={handleCreateGroup}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Tworzenie..." : "Utwórz grupę"}
        </Button>
      </div>
    </Card>
  );
};