import { Card } from "@/components/ui/card";
import { PreferencesSection } from "@/components/sections/PreferencesSection";
import { motion } from "framer-motion";

export const ServicesSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="p-8 shadow-xl bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5 dark:from-background/80 dark:via-background/50 dark:to-purple-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Streaming Services
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your streaming service preferences
          </p>
        </div>
        <PreferencesSection />
      </Card>
    </motion.div>
  );
};