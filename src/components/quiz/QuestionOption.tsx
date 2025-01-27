import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionOptionProps {
  option: string;
  isSelected: boolean;
  onSelect: (option: string) => void;
  type: "single" | "multiple";
}

export const QuestionOption = ({
  option,
  isSelected,
  onSelect,
  type,
}: QuestionOptionProps) => {
  if (type === "multiple") {
    return (
      <div
        className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 bg-blue-500/20 hover:bg-blue-500/30' 
            : 'border-gray-800 hover:bg-gray-800/50'
        } cursor-pointer`}
        onClick={() => onSelect(option)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(option)}
          className="h-5 w-5 border-2 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
        <label className="text-base text-gray-200 cursor-pointer select-none flex-grow">
          {option}
        </label>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className={`h-auto w-full py-4 px-6 text-left justify-start transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-500 hover:bg-blue-600 border-blue-500' 
          : 'bg-black/20 hover:bg-gray-800/50 border-gray-800'
      }`}
      onClick={() => onSelect(option)}
    >
      {option}
    </Button>
  );
};