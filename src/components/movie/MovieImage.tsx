import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { MovieImageProps } from "@/types/movie";

export const MovieImage = ({ 
  imageUrl, 
  title,
  className,
  loading = "lazy",
  width = 300,
  height = 450 
}: MovieImageProps) => {
  return (
    <motion.img
      src={imageUrl || "/placeholder.svg"}
      alt={title}
      className={cn(
        "absolute inset-0 object-cover w-full h-full rounded-t-lg",
        !imageUrl && "opacity-50",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      loading={loading}
      width={width}
      height={height}
    />
  );
};