import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

interface ServiceItemProps {
  id: string;
  name: string;
  logo_url: string | null;
  isSelected: boolean;
  onToggle: () => void;
}

export const ServiceItem = ({ id, name, logo_url, isSelected, onToggle }: ServiceItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex items-center space-x-3 p-4 rounded-xl hover:bg-accent/10 transition-all duration-300 border border-transparent hover:border-accent/20"
    >
      <Checkbox
        id={id}
        checked={isSelected}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
      <div className="flex items-center space-x-3 flex-1">
        {logo_url && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 p-1.5 transition-transform group-hover:scale-110">
            <img
              src={logo_url}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <label
          htmlFor={id}
          className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {name}
        </label>
      </div>
    </motion.div>
  );
};