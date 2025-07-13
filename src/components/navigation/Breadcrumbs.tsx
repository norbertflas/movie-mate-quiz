import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

interface BreadcrumbsProps {
  path: string;
}

export const Breadcrumbs = ({ path }: BreadcrumbsProps) => {
  const pathSegments = path.split('/').filter(Boolean);
  
  return (
    <motion.div 
      className="flex items-center space-x-2 text-sm text-muted-foreground"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathSegments.map((segment, index) => (
        <motion.div 
          key={segment} 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ChevronRight className="h-4 w-4" />
          <Link 
            to={`/${pathSegments.slice(0, index + 1).join('/')}`}
            className="capitalize hover:text-foreground transition-colors"
          >
            {segment}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};