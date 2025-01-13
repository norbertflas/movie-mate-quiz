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
      <Card className="shadow-lg bg-gradient-to-br from-background/80 to-background">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
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