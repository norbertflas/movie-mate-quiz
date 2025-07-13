import { Slider } from "@/components/ui/slider";

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  displayValue?: (value: number) => string;
}

export const RangeFilter = ({
  label,
  min,
  max,
  step,
  value,
  onValueChange,
  displayValue = (v) => v.toString(),
}: RangeFilterProps) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onValueChange}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        {value.length === 2 ? (
          <>
            <span>{displayValue(value[0])}</span>
            <span>{displayValue(value[1])}</span>
          </>
        ) : (
          <span>{displayValue(value[0])}</span>
        )}
      </div>
    </div>
  );
};