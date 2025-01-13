import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { Card } from "../ui/card";

interface MovieStreamingServicesProps {
  services: string[];
}

export const MovieStreamingServices = ({ services }: MovieStreamingServicesProps) => {
  if (!services.length) return null;

  return (
    <Card className="p-4 bg-background/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {services.map((service, index) => (
          <motion.div
            key={service}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1.5"
            >
              <span className="font-medium">{service}</span>
            </Badge>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
};