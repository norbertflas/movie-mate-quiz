import { supabase } from "@/integrations/supabase/client";

export const getStreamingServicesByRegion = async (region: string) => {
  const { data: services, error } = await supabase
    .from('streaming_services')
    .select('*')
    .contains('regions', [region.toLowerCase()]);

  if (error) {
    console.error('Error fetching streaming services:', error);
    return [];
  }

  return services;
};

export const languageToRegion: { [key: string]: string } = {
  pl: 'pl',
  en: 'en',
};