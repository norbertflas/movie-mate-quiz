import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const Ratings = () => {
  const { t } = useTranslation();
  const [hasRatings] = useState(false); // This will be connected to real data later

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("navigation.ratings")}</h1>
      {!hasRatings ? (
        <div className="text-center py-12 space-y-4">
          <Star className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            {t("ratings.noRatings")}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t("ratings.noRatingsDescription")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* TODO: Display rated movies */}
        </div>
      )}
    </div>
  );
};

export default Ratings;