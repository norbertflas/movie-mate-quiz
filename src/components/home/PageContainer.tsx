
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className={`container mx-auto ${isMobile ? 'px-2' : 'px-4'} py-4 sm:py-8 flex-grow max-w-full overflow-x-hidden`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-8 w-full"
        >
          {children}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};
