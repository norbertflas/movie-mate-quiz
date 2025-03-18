
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const Logo = ({ size = "md", animated = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const logoContent = (
    <div className={`relative ${sizeClasses[size]}`}>
      <img 
        src="/lovable-uploads/872064e5-afe2-48dd-9ec9-ab23765bbfba.png" 
        alt="MovieFinder Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center"
      >
        <Link to="/" className="flex items-center gap-2">
          {logoContent}
          <motion.span 
            className="font-bold text-lg md:text-xl hidden sm:block"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            MovieFinder
          </motion.span>
        </Link>
      </motion.div>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-2">
      {logoContent}
      <span className="font-bold text-lg md:text-xl hidden sm:block">
        MovieFinder
      </span>
    </Link>
  );
};
