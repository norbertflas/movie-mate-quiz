import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MovieImageProps {
  imageUrl: string;
  title: string;
}

export const MovieImage = ({ imageUrl, title }: MovieImageProps) => {
  return (
    <motion.img
      src={imageUrl || "/placeholder.svg"}
      alt={title}
      className={cn(
        "absolute inset-0 object-cover w-full h-full rounded-t-lg",
        !imageUrl && "opacity-50"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      loading="lazy"
    />
  );
};