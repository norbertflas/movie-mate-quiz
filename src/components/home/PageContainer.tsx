import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/80 via-violet-50/80 to-purple-50/80 dark:from-blue-950/50 dark:via-violet-950/50 dark:to-purple-950/50">
      <div className="container mx-auto px-4 py-8 space-y-8 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {children}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};