import { UserStreamingPreferences } from "@/components/UserStreamingPreferences";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const PreferencesSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
        <div className="mb-8">
          <UserStreamingPreferences />
        </div>
      </Card>
    </motion.div>
  );
};