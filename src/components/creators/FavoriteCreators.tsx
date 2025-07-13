import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FavoriteCreatorsList } from "./FavoriteCreatorsList";

export const FavoriteCreators = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="shadow-lg bg-gradient-to-br from-background/80 to-background border-blue-600/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            {t("creators.favoriteCreators")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FavoriteCreatorsList />
        </CardContent>
      </Card>
    </motion.div>
  );
};