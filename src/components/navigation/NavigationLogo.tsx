
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationLogoProps {
  scrolled: boolean;
}

export const NavigationLogo = ({ scrolled }: NavigationLogoProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05, 
      rotate: 2,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="flex items-center md:w-1/4">
      <motion.div
        variants={logoVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="cursor-pointer"
        onClick={() => navigate('/')}
      >
        <Logo animated showBeta />
      </motion.div>
      
      {!isMobile && (
        <motion.div 
          className="ml-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-400">
            Online
          </Badge>
          {scrolled && (
            <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
              {Math.round(window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100)}%
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
};
