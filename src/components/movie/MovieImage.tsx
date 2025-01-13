import { motion } from "framer-motion";

interface MovieImageProps {
  imageUrl: string;
  title: string;
}

export const MovieImage = ({ imageUrl, title }: MovieImageProps) => {
  return (
    <motion.img
      src={imageUrl}
      alt={title}
      className="object-cover w-full h-full"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    />
  );
};