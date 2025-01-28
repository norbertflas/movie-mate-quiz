import { MovieFilterSection } from "../movie/MovieFilterSection";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getStreamingServicesByRegion, languageToRegion } from "@/utils/streamingServices";

interface PlatformFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export const PlatformFilter = ({ value, onChange }: PlatformFilterProps) => {
  const [streamingServices, setStreamingServices] = useState<any[]>([]);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const fetchStreamingServices = async () => {
      const region = languageToRegion[i18n.language] || 'en';
      const services = await getStreamingServicesByRegion(region);
      setStreamingServices(services);
    };

    fetchStreamingServices();
  }, [i18n.language]);

  return (
    <MovieFilterSection
      label={t("filters.platform")}
      value={value}
      onValueChange={onChange}
      placeholder={t("filters.selectPlatform")}
      options={streamingServices.map(service => ({
        id: service.id,
        name: service.name,
      }))}
    />
  );
};