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
        className="flex items-center space-x-3 p-4 rounded-lg border border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
        onClick={() => onSelect(option)}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(option)}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <label className="text-base text-gray-200 cursor-pointer select-none">
          {option}
        </label>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className={`h-auto w-full py-4 px-6 text-left justify-start transition-all duration-200 hover:bg-gray-800/50 hover:border-gray-700 ${
        isSelected ? 'bg-gray-800 border-gray-700' : 'bg-black/20 border-gray-800'
      }`}
      onClick={() => onSelect(option)}
    >
      {option}
    </Button>
  );
};