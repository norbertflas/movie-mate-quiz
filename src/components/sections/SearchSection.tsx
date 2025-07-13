import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const SearchSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
        <div className="mb-8">
          <SearchBar />
        </div>
      </Card>
    </motion.div>
  );
};