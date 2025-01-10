import { Button } from "./ui/button";
import { Dice6 } from "lucide-react";

export const QuickActions = () => {
  const handleRandomPick = () => {
    // TODO: Implement random movie/show selection
    console.log("Picking random title...");
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