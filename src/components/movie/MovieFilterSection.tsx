import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface MovieFilterSectionProps {
  label: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { id: string; name: string }[];
}

export const MovieFilterSection = ({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: MovieFilterSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};