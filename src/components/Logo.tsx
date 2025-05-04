
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const Logo = ({ size = "md", animated = true }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12"
  };

  const logoContent = (
    <div className={`relative ${sizeClasses[size]} flex items-center`}>
      <motion.div
        className="mr-2"
        whileHover={{ rotate: 10 }}
        transition={{ duration: 0.2 }}
      >
        <img 
          src="/lovable-uploads/a19c50cb-957d-4c09-8623-3478de4a026d.png" 
          alt="MovieFinder Logo" 
          className="h-full w-auto object-contain"
        />
      </motion.div>
      <span className="font-bold text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 whitespace-nowrap hidden sm:block">
        MovieFinder
      </span>
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
        </Link>
      </motion.div>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-2">
      {logoContent}
    </Link>
  );
};
