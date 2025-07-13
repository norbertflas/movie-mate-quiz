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
      <Card className="p-8 shadow-xl bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5 dark:from-background/80 dark:via-background/50 dark:to-purple-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
        <div className="space-y-8">
          <UserStreamingPreferences />
        </div>
      </Card>
    </motion.div>
  );
};