import { Button } from "./ui/button";
import { Dice6 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { SAMPLE_RECOMMENDATIONS } from "./QuizSection";

export const QuickActions = () => {
  const { toast } = useToast();

  const handleRandomPick = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_RECOMMENDATIONS.length);
    const randomTitle = SAMPLE_RECOMMENDATIONS[randomIndex];
    
    toast({
      title: "Wylosowany tytuł",
      description: `${randomTitle.title} (${randomTitle.year}) - ${randomTitle.platform}`,
    });
  };

  return (
    <div className="flex justify-center gap-4 mb-8">
      <Button onClick={handleRandomPick} variant="outline">
        <Dice6 className="mr-2 h-4 w-4" />
        Losuj tytuł
      </Button>
    </div>
  );
};